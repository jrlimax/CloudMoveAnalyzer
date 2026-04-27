import { describe, it, expect, beforeAll } from 'vitest';
import { loadMoveDatabase } from '../helpers/load-source.js';

describe('Move Database Integrity', () => {
  let db;
  let entries;

  beforeAll(() => {
    db = loadMoveDatabase();
    entries = Object.entries(db.MOVE_DB);
  });

  it('parses without errors', () => {
    expect(db.MOVE_DB).toBeDefined();
    expect(typeof db.MOVE_DB).toBe('object');
  });

  it('has at least 500 resource type entries', () => {
    expect(entries.length).toBeGreaterThan(500);
  });

  it('every entry has the 3 required fields (moveRG, moveSub, moveRegion)', () => {
    for (const [key, value] of entries) {
      expect(value, `${key} missing fields`).toHaveProperty('moveRG');
      expect(value, `${key} missing fields`).toHaveProperty('moveSub');
      expect(value, `${key} missing fields`).toHaveProperty('moveRegion');
    }
  });

  it('field values are always 0 or 1', () => {
    for (const [key, value] of entries) {
      expect([0, 1], `${key}.moveRG`).toContain(value.moveRG);
      expect([0, 1], `${key}.moveSub`).toContain(value.moveSub);
      expect([0, 1], `${key}.moveRegion`).toContain(value.moveRegion);
    }
  });

  it('all keys are lowercase', () => {
    for (const [key] of entries) {
      expect(key, `Key not lowercase: ${key}`).toBe(key.toLowerCase());
    }
  });

  it('all keys follow Microsoft.X/Y namespace format', () => {
    for (const [key] of entries) {
      expect(key, `Invalid namespace: ${key}`).toMatch(/^[a-z]+\.[a-z0-9]+\/[a-z0-9]+/);
    }
  });

  it('no duplicate keys', () => {
    const keys = entries.map(([k]) => k);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('contains well-known resource types', () => {
    // Sanity check: the most common Azure resources must be present
    const required = [
      'microsoft.compute/virtualmachines',
      'microsoft.storage/storageaccounts',
      'microsoft.network/virtualnetworks',
      'microsoft.web/sites',
      'microsoft.sql/servers',
      'microsoft.keyvault/vaults',
    ];
    for (const type of required) {
      expect(db.MOVE_DB[type], `Missing critical type: ${type}`).toBeDefined();
    }
  });

  it('Microsoft.Compute/virtualMachines supports all move scenarios', () => {
    const vm = db.MOVE_DB['microsoft.compute/virtualmachines'];
    expect(vm.moveRG).toBe(1);
    expect(vm.moveSub).toBe(1);
  });

  it('MOVE_NOTES references valid resource types', () => {
    expect(db.MOVE_NOTES).toBeDefined();
    for (const [noteKey] of Object.entries(db.MOVE_NOTES)) {
      expect(noteKey, `Invalid note key: ${noteKey}`).toMatch(/^[a-z]+\.[a-z0-9]+\/[a-z0-9/]+/);
    }
  });
});

describe('parseMoveCSV', () => {
  let parseMoveCSV;

  beforeAll(() => {
    ({ parseMoveCSV } = loadMoveDatabase());
  });

  it('parses a valid 4-column line', () => {
    const result = parseMoveCSV('Microsoft.Test/foo,1,1,0');
    expect(result['microsoft.test/foo']).toEqual({
      moveRG: 1,
      moveSub: 1,
      moveRegion: 0,
    });
  });

  it('skips lines without /', () => {
    const result = parseMoveCSV('not-a-resource,1,1,1');
    expect(Object.keys(result).length).toBe(0);
  });

  it('skips lines with too few columns', () => {
    const result = parseMoveCSV('Microsoft.Test/foo,1');
    expect(Object.keys(result).length).toBe(0);
  });

  it('handles NaN values gracefully (defaults to 0)', () => {
    const result = parseMoveCSV('Microsoft.Test/foo,abc,1,xyz');
    expect(result['microsoft.test/foo']).toEqual({
      moveRG: 0,
      moveSub: 1,
      moveRegion: 0,
    });
  });

  it('lowercases keys for case-insensitive lookup', () => {
    const result = parseMoveCSV('MICROSOFT.TEST/FOO,1,1,1');
    expect(result['microsoft.test/foo']).toBeDefined();
    expect(result['MICROSOFT.TEST/FOO']).toBeUndefined();
  });

  it('parses multiple lines', () => {
    const csv = 'Microsoft.A/foo,1,0,0\nMicrosoft.B/bar,0,1,0\nMicrosoft.C/baz,1,1,1';
    const result = parseMoveCSV(csv);
    expect(Object.keys(result).length).toBe(3);
  });
});
