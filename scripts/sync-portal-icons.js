#!/usr/bin/env node
/**
 * Sync Azure Portal resource-type → friendly-name mapping into a local snapshot.
 *
 * Purpose
 * -------
 *   The Azure Portal renders an icon for each ARM resource type. Microsoft
 *   does not publish that mapping in any official, machine-readable form, so
 *   we use the publicly-visible Portal metadata aggregated at
 *
 *      https://github.com/maskati/azure-icons
 *
 *   which is auto-extracted from the Portal via GitHub Actions. We do NOT
 *   import this repo as a runtime dependency, and we do NOT copy any of
 *   their SVG files. We only extract the metadata table (resourceType →
 *   friendly name + svg path) and persist it locally as
 *
 *      data/portal-icon-snapshot.json
 *
 *   Run this script when you want to refresh the snapshot against a newer
 *   Portal version. The reconciler (scripts/reconcile-icons.js) then uses
 *   the snapshot to suggest updates to data/icon-map.json — our own
 *   curated mapping that points at our own SVG pack.
 *
 * Usage
 *   node scripts/sync-portal-icons.js
 *   node scripts/sync-portal-icons.js --dry-run     (parse only, no write)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..');
const OUT_PATH   = path.join(REPO_ROOT, 'data', 'portal-icon-snapshot.json');
const SOURCE_URL = 'https://raw.githubusercontent.com/maskati/azure-icons/main/README.md';

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
async function fetchReadme() {
  process.stdout.write(`Fetching ${SOURCE_URL} ... `);
  const res = await fetch(SOURCE_URL, {
    headers: { 'user-agent': 'CloudMoveAnalyzer-icon-sync/1.0' }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  console.log(`${(text.length / 1024).toFixed(1)} KB`);
  return text;
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
// Header line example:    "Extracted from Azure Portal version 17.385.5.1 on 2026-06-17."
const VERSION_RE = /Extracted from Azure Portal version\s+(\S+)\s+on\s+(\d{4}-\d{2}-\d{2})/i;

// Each table row looks like (rendered, may span lines):
//   | [Friendly Name](svg/Folder/IconName.svg) | Microsoft.Foo/ bar/ baz |
// The 3rd column is optional — empty means the icon represents a Portal
// blade/UI element that has no underlying ARM resource type; we skip those.
const ROW_RE = /\|\s*\[([^\]]+)\]\(([^)]+\.svg)\)\s*\|\s*([^|]*?)\s*\|/g;

function parseReadme(md) {
  // Squash whitespace inside table cells (the GitHub renderer adds line
  // breaks inside cells for readability, but the raw markdown has them as
  // literal whitespace; same as for cells split across lines).
  const flat = md.replace(/\r\n/g, '\n');

  const versionMatch = flat.match(VERSION_RE);
  const portalVersion = versionMatch ? versionMatch[1] : 'unknown';
  const extractedAt   = versionMatch ? versionMatch[2] : null;

  const entries = [];
  const seen = new Set();
  const skippedNoType = [];

  let m;
  while ((m = ROW_RE.exec(flat)) !== null) {
    const friendlyRaw = m[1].replace(/\s+/g, ' ').trim();
    const svgPath     = m[2].trim();
    const typeRaw     = m[3].replace(/\s+/g, '').trim(); // strip ALL whitespace

    if (!typeRaw) {
      skippedNoType.push(friendlyRaw);
      continue;
    }

    const resourceType = typeRaw.toLowerCase();
    // De-duplicate by resourceType (the Portal has multiple icons for the
    // same type sometimes — first occurrence wins, which is usually the
    // most recently-extracted one).
    if (seen.has(resourceType)) continue;
    seen.add(resourceType);

    entries.push({
      resourceType,
      friendlyName: friendlyRaw,
      portalSvgPath: svgPath
    });
  }

  // Stable sort for diff-friendly output
  entries.sort((a, b) => a.resourceType.localeCompare(b.resourceType));

  return { portalVersion, extractedAt, entries, skippedNoType };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const md = await fetchReadme();
  const { portalVersion, extractedAt, entries, skippedNoType } = parseReadme(md);

  console.log('');
  console.log(`Portal version    : ${portalVersion}`);
  console.log(`Extracted on      : ${extractedAt ?? '(unknown)'}`);
  console.log(`Resource types    : ${entries.length}`);
  console.log(`UI-only entries   : ${skippedNoType.length} (skipped, no ARM type)`);

  const snapshot = {
    $note: 'Mapping table reconstructed from publicly-visible Azure Portal metadata. We do NOT redistribute Portal SVGs — only the resourceType → friendly-name index. See scripts/sync-portal-icons.js for refresh instructions.',
    sourceUrl: SOURCE_URL,
    sourceProject: 'https://github.com/maskati/azure-icons (MIT, auto-extracted from Azure Portal)',
    portalVersion,
    extractedAt,
    fetchedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries
  };

  if (DRY_RUN) {
    console.log('\n(dry run — not writing file)');
    console.log('First 5 entries:');
    for (const e of entries.slice(0, 5)) {
      console.log(`  ${e.resourceType.padEnd(60)} → "${e.friendlyName}"`);
    }
    return;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(`\nWrote ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024).toFixed(1)} KB)`);
})().catch(err => {
  console.error('\nsync-portal-icons FAILED:', err.message);
  process.exit(1);
});
