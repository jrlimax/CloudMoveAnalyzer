import { describe, it, expect } from 'vitest';
import { loadColumnFunctions } from '../helpers/load-source.js';

const {
  normalizeHeader,
  findTypeCol,
  findNameCol,
  findLinkCol,
  findRGCol,
  findLocCol,
} = loadColumnFunctions();

const NBSP = '\u00a0';

describe('normalizeHeader', () => {
  it('lowercases and trims', () => {
    expect(normalizeHeader('  LOCATION  ')).toBe('location');
  });

  it('converts non-breaking spaces to regular spaces', () => {
    expect(normalizeHeader(`GRUPO${NBSP}DE RECURSOS`)).toBe('grupo de recursos');
  });

  it('collapses repeated whitespace', () => {
    expect(normalizeHeader('RESOURCE   GROUP')).toBe('resource group');
  });

  it('handles null/undefined safely', () => {
    expect(normalizeHeader(null)).toBe('');
    expect(normalizeHeader(undefined)).toBe('');
  });
});

describe('column detection — Azure Portal EN export', () => {
  const headers = ['NAME', 'TYPE', 'RESOURCE GROUP', 'LOCATION', 'SUBSCRIPTION'];

  it('detects every column', () => {
    expect(findNameCol(headers)).toBe('NAME');
    expect(findTypeCol(headers)).toBe('TYPE');
    expect(findRGCol(headers)).toBe('RESOURCE GROUP');
    expect(findLocCol(headers)).toBe('LOCATION');
  });
});

describe('column detection — Azure Portal pt-BR export (regression)', () => {
  // Real portal export: "GRUPO DE RECURSOS" contains a non-breaking space
  // (U+00A0) and the location column is named "LOCAL".
  const headers = [
    'NOME',
    'TIPO',
    `GRUPO${NBSP}DE RECURSOS`,
    'LOCAL',
    'ASSINATURA',
    'LINK DE RECURSOS',
  ];

  it('detects resource group despite the non-breaking space', () => {
    expect(findRGCol(headers)).toBe(`GRUPO${NBSP}DE RECURSOS`);
  });

  it('detects "LOCAL" as the location column', () => {
    expect(findLocCol(headers)).toBe('LOCAL');
  });

  it('detects name, type and resource link', () => {
    expect(findNameCol(headers)).toBe('NOME');
    expect(findTypeCol(headers)).toBe('TIPO');
    expect(findLinkCol(headers)).toBe('LINK DE RECURSOS');
  });
});

describe('column detection — Resource Graph export', () => {
  const headers = ['name', 'id', 'type', 'location', 'resourceGroup', 'subscriptionId'];

  it('detects camelCase columns', () => {
    expect(findNameCol(headers)).toBe('name');
    expect(findTypeCol(headers)).toBe('type');
    expect(findRGCol(headers)).toBe('resourceGroup');
    expect(findLocCol(headers)).toBe('location');
  });
});

describe('column detection — exclusions', () => {
  it('does not pick ResourceGroupName as the name column', () => {
    const headers = ['ResourceGroupName', 'ResourceType', 'ResourceName'];
    expect(findNameCol(headers)).toBe('ResourceName');
    expect(findRGCol(headers)).toBe('ResourceGroupName');
  });
});
