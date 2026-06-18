/**
 * Validation tests for the Azure icon mapping.
 *
 * These tests catch common bugs before they reach the browser:
 *  1. Every slug in data/icon-map.json points to a real SVG in assets/icons/azure/.
 *  2. Every resource type in MOVE_DB resolves to *some* icon.
 *  3. Suspicious mismatches (e.g. SSH key -> virtual-machine) are flagged.
 *  4. js/icon-map.js stays in sync with data/icon-map.json (re-run build script).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMoveDatabase } from '../helpers/load-source.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const ICON_JSON_PATH = resolve(ROOT, 'data', 'icon-map.json');
const ICON_DIR       = resolve(ROOT, 'assets', 'icons', 'azure');
const ICON_MAP_JS    = resolve(ROOT, 'js', 'icon-map.js');

// ---------------------------------------------------------------------------
// Load fixtures
// ---------------------------------------------------------------------------
const iconJson = JSON.parse(readFileSync(ICON_JSON_PATH, 'utf8'));

const overrides = {};
for (const entries of Object.values(iconJson.overrides || {})) {
  for (const [type, slug] of Object.entries(entries)) {
    overrides[type.toLowerCase()] = slug === null ? null : slug.toLowerCase();
  }
}

const namespaceFallback = {};
for (const entries of Object.values(iconJson.namespaceFallback || {})) {
  for (const [ns, slug] of Object.entries(entries)) {
    namespaceFallback[ns.toLowerCase()] = slug === null ? null : slug.toLowerCase();
  }
}

const availableSvgs = new Set(
  readdirSync(ICON_DIR)
    .filter(f => f.toLowerCase().endsWith('.svg'))
    .map(f => f.slice(0, -4).toLowerCase())
);

const { MOVE_DB } = loadMoveDatabase();

// Build getIconForType clone (mirrors js/icon-map.js logic)
// Returns the resolved slug, or null when the type is explicitly marked uncertain
// (falls back to app logo), or '' when no mapping exists at all.
function getIconForType(rawType) {
  if (!rawType) return '';
  const clean = String(rawType).toLowerCase().trim().replace(/^\//, '');

  if (Object.prototype.hasOwnProperty.call(overrides, clean)) {
    return overrides[clean] === null ? '__falcon__' : overrides[clean];
  }
  const parts = clean.split('/');
  for (let len = parts.length - 1; len >= 2; len--) {
    const attempt = parts.slice(0, len).join('/');
    if (Object.prototype.hasOwnProperty.call(overrides, attempt)) {
      return overrides[attempt] === null ? '__falcon__' : overrides[attempt];
    }
  }
  if (Object.prototype.hasOwnProperty.call(namespaceFallback, parts[0])) {
    return namespaceFallback[parts[0]] === null ? '__falcon__' : namespaceFallback[parts[0]];
  }
  return '';
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('data/icon-map.json structure', () => {
  it('has both overrides and namespaceFallback sections', () => {
    expect(iconJson.overrides).toBeTypeOf('object');
    expect(iconJson.namespaceFallback).toBeTypeOf('object');
    expect(Object.keys(overrides).length).toBeGreaterThan(500);
    expect(Object.keys(namespaceFallback).length).toBeGreaterThan(50);
  });

  it('uses lowercase resource type keys', () => {
    const invalid = Object.keys(overrides).filter(k => k !== k.toLowerCase());
    expect(invalid, 'These keys should be lowercase:\n' + invalid.join('\n')).toEqual([]);
  });

  it('uses kebab-case slug values without .svg extension', () => {
    const allSlugs = [...Object.values(overrides), ...Object.values(namespaceFallback)]
      .filter(s => s !== null);
    const badSlugs = allSlugs.filter(s => s.endsWith('.svg') || s !== s.toLowerCase());
    expect(badSlugs, 'Slugs must be lowercase and without .svg:\n' + badSlugs.join('\n')).toEqual([]);
  });
});

describe('data/icon-map.json -> SVG references', () => {
  it('every override slug exists in assets/icons/azure/', () => {
    const missing = [];
    for (const [type, slug] of Object.entries(overrides)) {
      if (slug === null) continue; // explicit "uncertain" — falcon fallback
      if (!availableSvgs.has(slug)) missing.push(`${type} -> ${slug}.svg`);
    }
    expect(missing, 'Broken override references:\n' + missing.join('\n')).toEqual([]);
  });

  it('every namespaceFallback slug exists in assets/icons/azure/', () => {
    const missing = [];
    for (const [ns, slug] of Object.entries(namespaceFallback)) {
      if (slug === null) continue;
      if (!availableSvgs.has(slug)) missing.push(`${ns} -> ${slug}.svg`);
    }
    expect(missing, 'Broken namespace fallback references:\n' + missing.join('\n')).toEqual([]);
  });
});

describe('icon resolution coverage', () => {
  // These resource types are 3rd-party SaaS publishers exposed under the
  // Microsoft.* namespace via Marketplace. They legitimately have no Microsoft
  // icon and fall back to the app logo (falcon). Update this list when adding
  // new 3rd-party providers.
  const THIRD_PARTY_PUBLISHERS_UNDER_MICROSOFT = new Set([
    'microsoft.mongodb',
    'microsoft.datadog',
    'microsoft.confluent',
    'microsoft.newrelicobservability',
    'microsoft.dynatrace',
    'microsoft.logz',
    'microsoft.nginx',
    'microsoft.qumulo.storage',
    'microsoft.cloudngfwbypaloaltonetworks',
    'microsoft.astronomer',
    'microsoft.pinecone.vectordb',
    'microsoft.weightsandbiases',
    'microsoft.lambdatest.hyperexecute',
    'microsoft.commvault',
    'microsoft.elastic',
  ]);

  it('every Microsoft resource type in MOVE_DB resolves to some icon', () => {
    const noIcon = Object.keys(MOVE_DB)
      .filter(t => t.startsWith('microsoft.'))
      .filter(t => !THIRD_PARTY_PUBLISHERS_UNDER_MICROSOFT.has(t.split('/')[0]))
      .filter(t => !getIconForType(t));
    expect(noIcon, 'Microsoft types without icon:\n' + noIcon.join('\n')).toEqual([]);
  });

  it('coverage stays at or above 99% of all MOVE_DB types', () => {
    const total = Object.keys(MOVE_DB).length;
    const withIcon = Object.keys(MOVE_DB).filter(t => getIconForType(t)).length;
    const pct = (withIcon / total) * 100;
    expect(pct, `Only ${pct.toFixed(2)}% of ${total} types have icons`).toBeGreaterThanOrEqual(99);
  });
});

describe('semantic sanity checks', () => {
  // Rules: (regex on type)  ->  (regex that slug MUST match | regex slug MUST NOT match)
  // Catches the "SSH key -> virtual-machine" class of bug.
  const RULES = [
    {
      name: 'SSH key types use an ssh icon',
      typeRe: /\/sshpublickeys?$/,
      mustMatch: /ssh/,
    },
    {
      name: 'Storage account types use a storage icon',
      typeRe: /^microsoft\.storage\/storageaccounts$/,
      mustMatch: /storage/,
    },
    {
      name: 'Key Vault uses a key-vault icon',
      typeRe: /^microsoft\.keyvault\/vaults$/,
      mustMatch: /key.?vault/,
    },
    {
      name: 'Virtual Network uses a network icon',
      typeRe: /^microsoft\.network\/virtualnetworks$/,
      mustMatch: /(virtual.?network|vnet)/,
    },
    {
      name: 'Public IP uses an IP icon',
      typeRe: /^microsoft\.network\/publicipaddresses$/,
      mustMatch: /(public.?ip|ip.?address)/,
    },
    {
      name: 'Disks use a disk icon',
      typeRe: /^microsoft\.compute\/disks$/,
      mustMatch: /disk/,
    },
    {
      name: 'NSG uses a security icon',
      typeRe: /^microsoft\.network\/networksecuritygroups$/,
      mustMatch: /(security|nsg)/,
    },
    {
      name: 'Microsoft Fabric capacity uses a capacity icon',
      typeRe: /^microsoft\.fabric\/capacities$/,
      mustMatch: /(capacity|fabric|power.?bi)/,
    },
    {
      name: 'Bastion uses a bastion icon',
      typeRe: /^microsoft\.network\/bastionhosts$/,
      mustMatch: /bastion/,
    },
    {
      name: 'Cosmos DB uses a cosmos icon',
      typeRe: /^microsoft\.documentdb\/databaseaccounts$/,
      mustMatch: /cosmos/,
    },
  ];

  for (const rule of RULES) {
    it(rule.name, () => {
      // Find types in MOVE_DB matching this rule
      const matchingTypes = Object.keys(MOVE_DB).filter(t => rule.typeRe.test(t));
      if (matchingTypes.length === 0) {
        // Rule not exercised by MOVE_DB - still validate the rule itself works
        // by checking the override directly when present
        const directHit = Object.keys(overrides).find(t => rule.typeRe.test(t));
        if (directHit) {
          const slug = getIconForType(directHit);
          expect(slug, `${directHit} has no icon`).toBeTruthy();
          if (rule.mustMatch) expect(slug).toMatch(rule.mustMatch);
        }
        return; // No types to check
      }

      for (const type of matchingTypes) {
        const slug = getIconForType(type);
        expect(slug, `${type} has no icon`).toBeTruthy();
        if (rule.mustMatch) {
          expect(
            slug,
            `${type} -> ${slug} (expected to match /${rule.mustMatch.source}/)`
          ).toMatch(rule.mustMatch);
        }
        if (rule.mustNotMatch) {
          expect(
            slug,
            `${type} -> ${slug} (must NOT match /${rule.mustNotMatch.source}/)`
          ).not.toMatch(rule.mustNotMatch);
        }
      }
    });
  }
});

describe('js/icon-map.js is in sync with data/icon-map.json', () => {
  it('js/icon-map.js exists and references at least as many overrides as JSON', () => {
    expect(existsSync(ICON_MAP_JS)).toBe(true);
    const jsContent = readFileSync(ICON_MAP_JS, 'utf8');
    const iconMapMatch = jsContent.match(/const\s+ICON_MAP\s*=\s*\{([\s\S]*?)\n\};/);
    expect(iconMapMatch, 'ICON_MAP not found in js/icon-map.js').toBeTruthy();
    const jsKeyCount = (iconMapMatch[1].match(/^\s*"/gm) || []).length;
    expect(
      jsKeyCount,
      `js/icon-map.js has ${jsKeyCount} entries but data/icon-map.json has ${Object.keys(overrides).length} overrides. ` +
      'Run: node scripts/build-icon-map.js'
    ).toBeGreaterThanOrEqual(Object.keys(overrides).length);
  });
});
