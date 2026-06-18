#!/usr/bin/env node
/**
 * Reconcile data/portal-icon-snapshot.json against:
 *   - assets/icons/azure/*.svg   (our Microsoft Architecture Icons pack)
 *   - data/icon-map.json         (our curated overrides)
 *
 * Goal: highlight what data/icon-map.json could be updated with, based on
 * the Portal's own friendly names — without overwriting human curation.
 *
 * Categories per Portal entry:
 *   AGREE     — Portal friendly name maps to a local slug that matches what
 *               icon-map.json already says.
 *   CONFLICT  — Portal friendly name maps to a local slug that DIFFERS from
 *               what icon-map.json says (review carefully — Portal may be
 *               right, or the existing override may be intentional).
 *   NEW       — Resource type not in icon-map.json yet, but Portal friendly
 *               name matches a local slug → safe candidate to add.
 *   UNMATCHED — Portal friendly name does not match any local SVG slug
 *               (we have no icon for it — keep falling back to falcon).
 *
 * Usage
 *   node scripts/reconcile-icons.js
 *   node scripts/reconcile-icons.js --suggest    (also writes data/icon-map.suggested.json)
 *   node scripts/reconcile-icons.js --only=microsoft  (filter resourceType prefix)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SNAPSHOT_PATH = path.join(REPO_ROOT, 'data', 'portal-icon-snapshot.json');
const ICON_JSON     = path.join(REPO_ROOT, 'data', 'icon-map.json');
const LOCAL_SVG_DIR = path.join(REPO_ROOT, 'assets', 'icons', 'azure');
const SUGGEST_PATH  = path.join(REPO_ROOT, 'data', 'icon-map.suggested.json');

const SUGGEST = process.argv.includes('--suggest');
const onlyArg = process.argv.find(a => a.startsWith('--only='));
const ONLY_PREFIX = onlyArg ? onlyArg.split('=')[1].toLowerCase() : null;

const FUZZY_THRESHOLD = 0.6;

// ---------------------------------------------------------------------------
// Token / similarity helpers (same logic as build-icon-map.js)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Load inputs
// ---------------------------------------------------------------------------
function die(msg) { console.error('\nX ' + msg + '\n'); process.exit(1); }

if (!fs.existsSync(SNAPSHOT_PATH)) die(`Missing ${SNAPSHOT_PATH} — run scripts/sync-portal-icons.js first`);
if (!fs.existsSync(ICON_JSON))     die(`Missing ${ICON_JSON}`);
if (!fs.existsSync(LOCAL_SVG_DIR)) die(`Missing ${LOCAL_SVG_DIR}`);

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
const iconData = JSON.parse(fs.readFileSync(ICON_JSON, 'utf8'));

// Flatten { category: { type: slug } } → { type: slug }  (null kept)
const overrides = {};
for (const entries of Object.values(iconData.overrides || {})) {
  for (const [type, slug] of Object.entries(entries)) {
    overrides[type.toLowerCase()] = slug === null ? null : slug.toLowerCase();
  }
}

// Index local slugs
const localSlugs = new Set();
const localSlugTokens = new Map(); // slug → token set
for (const file of fs.readdirSync(LOCAL_SVG_DIR)) {
  if (!file.toLowerCase().endsWith('.svg')) continue;
  const slug = path.basename(file, '.svg').toLowerCase();
  localSlugs.add(slug);
  localSlugTokens.set(slug, tokenSet(slug));
}

console.log(`Portal snapshot   : ${snapshot.entries.length} entries (Portal v${snapshot.portalVersion}, extracted ${snapshot.extractedAt})`);
console.log(`Local SVG pack    : ${localSlugs.size} unique slugs in assets/icons/azure/`);
console.log(`Current overrides : ${Object.keys(overrides).length} resource types in data/icon-map.json`);
if (ONLY_PREFIX) console.log(`Filter            : --only=${ONLY_PREFIX}`);
console.log('');

// ---------------------------------------------------------------------------
// Match each Portal entry to a local slug via the friendly name
// ---------------------------------------------------------------------------
function bestSlugFor(friendlyName, resourceType) {
  // Try multiple seeds: friendly name, last segment of resource type, both.
  const lastSegment = resourceType.split('/').pop() || '';
  const seeds = [friendlyName, lastSegment, `${friendlyName} ${lastSegment}`].filter(Boolean);

  let best = { slug: null, score: 0 };
  for (const seed of seeds) {
    const seedTokens = tokenSet(seed);
    if (!seedTokens.size) continue;
    for (const [slug, slugTokens] of localSlugTokens) {
      const score = jaccard(seedTokens, slugTokens);
      if (score > best.score) best = { slug, score };
    }
  }
  return best;
}

const results = {
  agree:     [],
  conflict:  [],
  newMatch:  [],
  unmatched: []
};

for (const entry of snapshot.entries) {
  const { resourceType, friendlyName } = entry;
  if (ONLY_PREFIX && !resourceType.startsWith(ONLY_PREFIX)) continue;

  const match = bestSlugFor(friendlyName, resourceType);
  const portalSlug = (match.slug && match.score >= FUZZY_THRESHOLD) ? match.slug : null;

  const hasOverride = Object.prototype.hasOwnProperty.call(overrides, resourceType);
  const currentSlug = hasOverride ? overrides[resourceType] : undefined; // undefined=not set, null=explicit uncertain, string=mapped

  if (!portalSlug) {
    results.unmatched.push({
      resourceType, friendlyName,
      currentSlug, score: match.score, bestGuess: match.slug
    });
    continue;
  }

  if (!hasOverride || currentSlug === undefined) {
    results.newMatch.push({
      resourceType, friendlyName,
      suggestedSlug: portalSlug, score: match.score
    });
    continue;
  }

  if (currentSlug === portalSlug) {
    results.agree.push({ resourceType, slug: portalSlug });
  } else {
    results.conflict.push({
      resourceType, friendlyName,
      currentSlug, suggestedSlug: portalSlug, score: match.score
    });
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`=== Reconciliation report ===`);
console.log(`  AGREE     : ${results.agree.length}`);
console.log(`  CONFLICT  : ${results.conflict.length}`);
console.log(`  NEW       : ${results.newMatch.length}`);
console.log(`  UNMATCHED : ${results.unmatched.length}`);
console.log('');

if (results.conflict.length) {
  console.log(`--- CONFLICTS (${results.conflict.length}) — Portal disagrees with current icon-map.json ---`);
  for (const c of results.conflict.slice(0, 40)) {
    const cur = c.currentSlug === null ? '(explicit-null)' : c.currentSlug;
    console.log(`  ${c.resourceType}`);
    console.log(`      friendly  : "${c.friendlyName}"`);
    console.log(`      current   : ${cur}`);
    console.log(`      suggested : ${c.suggestedSlug}  (jaccard ${c.score.toFixed(2)})`);
  }
  if (results.conflict.length > 40) console.log(`  ... (${results.conflict.length - 40} more)`);
  console.log('');
}

if (results.newMatch.length) {
  console.log(`--- NEW MATCHES (${results.newMatch.length}) — safe candidates to add ---`);
  for (const n of results.newMatch.slice(0, 60)) {
    console.log(`  ${n.resourceType.padEnd(70)} → ${n.suggestedSlug}  (jaccard ${n.score.toFixed(2)})  "${n.friendlyName}"`);
  }
  if (results.newMatch.length > 60) console.log(`  ... (${results.newMatch.length - 60} more)`);
  console.log('');
}

if (results.unmatched.length) {
  const microsoftOnly = results.unmatched.filter(u => u.resourceType.startsWith('microsoft.'));
  console.log(`--- UNMATCHED (${results.unmatched.length} total, ${microsoftOnly.length} are microsoft.*) — no local SVG fits ---`);
  for (const u of microsoftOnly.slice(0, 30)) {
    const cur = u.currentSlug === undefined ? '(not in map)'
              : u.currentSlug === null ? '(explicit-null)' : u.currentSlug;
    const guess = u.bestGuess ? `best=${u.bestGuess} (${u.score.toFixed(2)})` : '';
    console.log(`  ${u.resourceType.padEnd(70)} current=${cur.padEnd(28)} ${guess}  "${u.friendlyName}"`);
  }
  if (microsoftOnly.length > 30) console.log(`  ... (${microsoftOnly.length - 30} more microsoft.* unmatched)`);
}

// ---------------------------------------------------------------------------
// Suggested file
// ---------------------------------------------------------------------------
if (SUGGEST) {
  const suggested = {
    $note: 'Auto-generated by scripts/reconcile-icons.js — do NOT commit blindly. Review each entry, then merge into data/icon-map.json by hand.',
    generatedAt: new Date().toISOString(),
    portalVersion: snapshot.portalVersion,
    conflicts:    results.conflict.map(c => ({
      resourceType: c.resourceType,
      friendlyName: c.friendlyName,
      currentSlug: c.currentSlug,
      portalSuggestedSlug: c.suggestedSlug
    })),
    newCandidates: results.newMatch.map(n => ({
      resourceType: n.resourceType,
      friendlyName: n.friendlyName,
      portalSuggestedSlug: n.suggestedSlug
    }))
  };
  fs.writeFileSync(SUGGEST_PATH, JSON.stringify(suggested, null, 2) + '\n', 'utf8');
  console.log(`\nWrote ${SUGGEST_PATH} for human review.`);
}
