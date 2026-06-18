#!/usr/bin/env node
/**
 * Build js/icon-map.js by combining:
 *   - data/icon-map.json (curated overrides + namespace fallbacks, edit by hand)
 *   - js/move-database.js (canonical list of Azure resource types)
 *   - Azure SVG icon source folder (705 SVGs)
 *
 * Pipeline:
 *   1. Load data/icon-map.json     (organized by category, human-editable)
 *   2. Validate every slug referenced in JSON has a matching SVG file on disk
 *   3. Fuzzy-match leftover resource types using friendly name vs SVG name
 *   4. Copy used SVGs to assets/icons/azure/<slug>.svg
 *   5. Emit js/icon-map.js
 *
 * To add or change an icon: edit data/icon-map.json (no JS needed).
 * Then run:  node scripts/build-icon-map.js
 *
 * Usage:
 *   node scripts/build-icon-map.js [path-to-Azure_Public_Service_Icons/Icons]
 *   node scripts/build-icon-map.js --verbose      (list unmatched types)
 *   node scripts/build-icon-map.js --check-only   (no copy, no write — validate only)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT     = path.resolve(__dirname, '..');
const ICON_JSON     = path.join(REPO_ROOT, 'data', 'icon-map.json');
const MOVE_DB_PATH  = path.join(REPO_ROOT, 'js', 'move-database.js');
const ICON_MAP_PATH = path.join(REPO_ROOT, 'js', 'icon-map.js');
const OUT_ICONS_DIR = path.join(REPO_ROOT, 'assets', 'icons', 'azure');

const VERBOSE    = process.argv.includes('--verbose');
const CHECK_ONLY = process.argv.includes('--check-only');

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const SRC_ICONS_DIR = positional[0]
  || 'C:\\Users\\José Alves\\Downloads\\Azure_Public_Service_Icons\\Icons';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const FUZZY_THRESHOLD = 0.6;

const norm = s => String(s).toLowerCase()
  .replace(/\(.*?\)/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim().split(/\s+/).filter(Boolean);

const tokenSet = s => new Set(norm(s));

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function svgSlug(svgFile) {
  return path.basename(svgFile, '.svg')
    .replace(/^\d+-icon-service-/i, '')
    .toLowerCase();
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && full.toLowerCase().endsWith('.svg')) acc.push(full);
  }
  return acc;
}

function die(msg) {
  console.error('\nX ' + msg + '\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Load curated icon-map.json
// ---------------------------------------------------------------------------
if (!fs.existsSync(ICON_JSON)) die(`Missing ${ICON_JSON}`);
const iconData = JSON.parse(fs.readFileSync(ICON_JSON, 'utf8'));

// Flatten { category: { type: slug } } → { type: slug }
// `slug` may be null = explicit "uncertain" (forces app-logo fallback)
const overrides = {};
for (const entries of Object.values(iconData.overrides || {})) {
  for (const [type, slug] of Object.entries(entries)) {
    overrides[type.toLowerCase()] = slug === null ? null : slug.toLowerCase();
  }
}

const namespaceFallback = {};
for (const entries of Object.values(iconData.namespaceFallback || {})) {
  for (const [ns, slug] of Object.entries(entries)) {
    namespaceFallback[ns.toLowerCase()] = slug === null ? null : slug.toLowerCase();
  }
}

console.log(`Loaded data/icon-map.json: ${Object.keys(overrides).length} overrides, ${Object.keys(namespaceFallback).length} namespace fallbacks`);

// ---------------------------------------------------------------------------
// 2. Load resource type catalog
// ---------------------------------------------------------------------------
const dbSrc = fs.readFileSync(MOVE_DB_PATH, 'utf8');
const rawMatch = dbSrc.match(/MOVE_DB_RAW\s*=\s*`([\s\S]*?)`/);
if (!rawMatch) die('Could not find MOVE_DB_RAW in js/move-database.js');

const resourceTypes = rawMatch[1]
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map(l => l.split(',')[0].toLowerCase().trim())
  .filter(t => t.includes('/'));

const FRIENDLY = {};
const friendlyBlock = dbSrc.match(/FRIENDLY_NAMES\s*=\s*\{([\s\S]*?)\n\};/);
if (friendlyBlock) {
  const re = /'([^']+)':\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(friendlyBlock[1]))) FRIENDLY[m[1].toLowerCase()] = m[2];
}

console.log(`Loaded ${resourceTypes.length} resource types + ${Object.keys(FRIENDLY).length} friendly names from move-database.js`);

// ---------------------------------------------------------------------------
// 3. Index SVG icon source
// ---------------------------------------------------------------------------
if (!fs.existsSync(SRC_ICONS_DIR)) die(`Icon source folder not found: ${SRC_ICONS_DIR}`);

const svgFiles  = walk(SRC_ICONS_DIR);
const svgIndex  = new Map();  // slug → full path
const svgTokens = new Map();  // slug → token set
for (const f of svgFiles) {
  const slug = svgSlug(f);
  if (!svgIndex.has(slug)) {
    svgIndex.set(slug, f);
    svgTokens.set(slug, tokenSet(slug));
  }
}
console.log(`Indexed ${svgFiles.length} SVG files (${svgIndex.size} unique slugs) from ${SRC_ICONS_DIR}`);

// ---------------------------------------------------------------------------
// 4. Validate: every slug in JSON must exist on disk
// ---------------------------------------------------------------------------
const brokenOverrides = [];
for (const [rt, slug] of Object.entries(overrides)) {
  if (slug === null) continue; // explicit "uncertain" — use app logo
  if (!svgIndex.has(slug)) brokenOverrides.push({ rt, slug });
}

const brokenFallbacks = [];
for (const [ns, slug] of Object.entries(namespaceFallback)) {
  if (slug === null) continue;
  if (!svgIndex.has(slug)) brokenFallbacks.push({ ns, slug });
}

if (brokenOverrides.length || brokenFallbacks.length) {
  console.error('\nX data/icon-map.json references SVG slugs that do not exist:');
  for (const { rt, slug } of brokenOverrides) {
    console.error(`   overrides.${rt} -> ${slug}.svg  (file not found)`);
  }
  for (const { ns, slug } of brokenFallbacks) {
    console.error(`   namespaceFallback.${ns} -> ${slug}.svg  (file not found)`);
  }
  console.error('\nFix data/icon-map.json (pick a different slug from assets/icons/azure/).');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 5. Build mapping: overrides first, then fuzzy match for the rest
// ---------------------------------------------------------------------------
const mapping     = {};   // resource type → slug
const matchSource = {};   // type → 'override' | 'fuzzy(0.xx)'

for (const [rt, slug] of Object.entries(overrides)) {
  mapping[rt] = slug; // may be null = uncertain
  matchSource[rt] = 'override';
}

const allTypes = new Set([...resourceTypes, ...Object.keys(FRIENDLY)]);
const unmatched = [];
for (const rt of allTypes) {
  if (Object.prototype.hasOwnProperty.call(mapping, rt)) continue;
  const friendly    = FRIENDLY[rt] || '';
  const lastSegment = rt.split('/').pop() || '';
  let best = { slug: null, score: 0 };
  for (const cand of [friendly, lastSegment].filter(Boolean)) {
    const ct = tokenSet(cand);
    if (!ct.size) continue;
    for (const [slug, st] of svgTokens) {
      const score = jaccard(ct, st);
      if (score > best.score) best = { slug, score };
    }
  }
  if (best.score >= FUZZY_THRESHOLD && best.slug) {
    mapping[rt] = best.slug;
    matchSource[rt] = `fuzzy(${best.score.toFixed(2)})`;
  } else {
    unmatched.push(rt);
  }
}

if (CHECK_ONLY) {
  console.log('\nOK Validation passed (--check-only: no files written)');
  console.log(`   ${Object.keys(mapping).length}/${allTypes.size} types matched, ${unmatched.length} fall back to namespace`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 6. Copy SVGs to assets/icons/azure/ (all of them, so JSON edits don't break)
// ---------------------------------------------------------------------------
fs.mkdirSync(OUT_ICONS_DIR, { recursive: true });
// Wipe stale SVGs first to keep folder clean
for (const f of fs.readdirSync(OUT_ICONS_DIR)) {
  if (f.toLowerCase().endsWith('.svg')) fs.unlinkSync(path.join(OUT_ICONS_DIR, f));
}
let copied = 0;
for (const [slug, src] of svgIndex) {
  fs.copyFileSync(src, path.join(OUT_ICONS_DIR, slug + '.svg'));
  copied++;
}

// LICENSE notice
const licensePath = path.join(OUT_ICONS_DIR, 'LICENSE.txt');
if (!fs.existsSync(licensePath)) {
  fs.writeFileSync(licensePath,
`Azure Architecture Icons
Source: https://learn.microsoft.com/azure/architecture/icons/
(c) Microsoft Corporation. All rights reserved.

Microsoft permits the use of these icons in architecture diagrams,
training materials, and documentation. You may copy, distribute, and
display the icons only for that permitted use, unless granted explicit
permission by Microsoft. Microsoft reserves all other rights.

Restrictions (do NOT):
  - Crop, flip, or rotate the icons.
  - Distort or alter the shape of the icons in any way.
  - Use Microsoft product icons to represent your product or service.

These icons are bundled with Cloud Move Analyzer purely as visual
labels next to Azure resource type names. They are not used as the
project's branding.
`);
}

// ---------------------------------------------------------------------------
// 7. Emit js/icon-map.js
// ---------------------------------------------------------------------------
const sortedKeys = Object.keys(mapping).sort();
const sortedNs   = Object.keys(namespaceFallback).sort();

const out = `/* eslint-disable */
/**
 * Azure resource type -> icon filename map.
 * Auto-generated by scripts/build-icon-map.js - DO NOT EDIT BY HAND.
 *
 * To add/change an icon: edit data/icon-map.json, then run
 *   node scripts/build-icon-map.js
 *
 * Icons are (c) Microsoft. See assets/icons/azure/LICENSE.txt
 */
const ICON_BASE = 'assets/icons/azure/';

const ICON_MAP = {
${sortedKeys.map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(mapping[k])}`).join(',\n')}
};

const ICON_NAMESPACE_FALLBACK = {
${sortedNs.map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(namespaceFallback[k])}`).join(',\n')}
};

/** Returns icon URL for a resource type. Falls back to the app logo when no
 *  Microsoft icon matches (third-party SaaS publishers, unknown providers, etc.).
 *  An explicit 'null' in ICON_MAP marks a type as "uncertain" — we know about
 *  it but won't pretend to know the icon, so we fall through to the app logo. */
function getIconForType(rawType) {
  if (!rawType) return 'assets/logo.png';
  const clean = String(rawType).toLowerCase().trim().replace(/^\\//, '');

  if (Object.prototype.hasOwnProperty.call(ICON_MAP, clean)) {
    const v = ICON_MAP[clean];
    return v ? ICON_BASE + v + '.svg' : 'assets/logo.png';
  }

  const parts = clean.split('/');
  for (let len = parts.length - 1; len >= 2; len--) {
    const attempt = parts.slice(0, len).join('/');
    if (Object.prototype.hasOwnProperty.call(ICON_MAP, attempt)) {
      const v = ICON_MAP[attempt];
      return v ? ICON_BASE + v + '.svg' : 'assets/logo.png';
    }
  }

  const ns = parts[0];
  if (Object.prototype.hasOwnProperty.call(ICON_NAMESPACE_FALLBACK, ns)) {
    const v = ICON_NAMESPACE_FALLBACK[ns];
    return v ? ICON_BASE + v + '.svg' : 'assets/logo.png';
  }
  return 'assets/logo.png';
}
`;
fs.writeFileSync(ICON_MAP_PATH, out);

// ---------------------------------------------------------------------------
// 8. Report
// ---------------------------------------------------------------------------
const overrideCount = Object.values(matchSource).filter(s => s === 'override').length;
const fuzzyCount    = Object.values(matchSource).filter(s => s.startsWith('fuzzy')).length;
const uncertainCount = Object.values(mapping).filter(v => v === null).length;

// Resolve every type to its final icon source: SVG (microsoft) or app logo (falcon).
let resolvedSvg = 0;
const falconTypes = [];
for (const t of allTypes) {
  const slug = mapping[t];
  if (slug) {
    resolvedSvg++;
    continue;
  }
  // null override OR no mapping at all: try namespace fallback
  const ns = t.split('/')[0];
  if (namespaceFallback[ns]) resolvedSvg++;
  else falconTypes.push(t);
}

console.log('\n------------------------------------------------');
console.log(`Icon map for ${allTypes.size} resource types:`);
console.log(`  - resolved to Microsoft SVG : ${resolvedSvg} (${(resolvedSvg/allTypes.size*100).toFixed(1)}%)`);
console.log(`     overrides (exact match)  : ${overrideCount - uncertainCount}`);
console.log(`     fuzzy match              : ${fuzzyCount}`);
console.log(`     namespace fallback       : ${resolvedSvg - (overrideCount - uncertainCount) - fuzzyCount}`);
console.log(`  - falls back to app logo    : ${falconTypes.length}`);
console.log(`     explicit "uncertain"     : ${uncertainCount}`);
console.log(`     no Microsoft icon known  : ${falconTypes.length - uncertainCount}`);
console.log(`  - SVGs copied to assets     : ${copied}`);
console.log('------------------------------------------------');

if (falconTypes.length) {
  console.log('\nTypes using app logo (falcon):');
  for (const t of falconTypes) console.log('  ' + t);
}

if (VERBOSE && unmatched.length) {
  console.log('\nResource types falling back to namespace icon:');
  for (const t of unmatched) {
    const ns = t.split('/')[0];
    const fb = namespaceFallback[ns];
    console.log(`  - ${t}  ->  ${fb || '(none - no icon shown)'}`);
  }
}

console.log('\nWrote:');
console.log('  ' + path.relative(REPO_ROOT, ICON_MAP_PATH));
console.log('  ' + path.relative(REPO_ROOT, OUT_ICONS_DIR) + path.sep);
console.log('\nTo edit the icon map: open data/icon-map.json');
