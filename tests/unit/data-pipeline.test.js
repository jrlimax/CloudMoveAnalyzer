/**
 * Tests for the data pipeline (applyStatusFilter, applySearch, applySort).
 *
 * These cover the bugs that historically bit us:
 *   1. Exports trazendo só "movable" porque usavam função com filtro de status
 *   2. Funções poliglotas misturando filtro + busca + sort
 *
 * Cada apply* é puro: recebe (rows, ...args) e retorna rows novos.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadPipelineFunctions } from '../helpers/load-source.js';

describe('Data Pipeline', () => {
  let applyStatusFilter, applySearch, applySort;

  beforeAll(() => {
    ({ applyStatusFilter, applySearch, applySort } = loadPipelineFunctions());
  });

  // Fixture: 4 linhas, uma de cada status
  const rows = () => [
    { name: 'vm-prod-01',  type: 'Microsoft.Compute/virtualMachines',  displayType: '', resourceGroup: 'rg-prod',  location: 'eastus',     status: 'movable',     noteKey: '' },
    { name: 'sql-shared',  type: 'Microsoft.Sql/servers',              displayType: '', resourceGroup: 'rg-data',  location: 'westus',     status: 'partial',     noteKey: 'noteSql' },
    { name: 'kv-vault-01', type: 'Microsoft.KeyVault/vaults',          displayType: '', resourceGroup: 'rg-sec',   location: 'centralus',  status: 'not-movable', noteKey: '' },
    { name: 'unknown-x',   type: 'Microsoft.Foo/bar',                  displayType: '', resourceGroup: 'rg-other', location: 'eastus',     status: 'unknown',     noteKey: '' },
  ];

  // ──────────────────────────────────────────────────────────
  describe('applyStatusFilter', () => {
    it('returns the original list when filter is "all"', () => {
      const data = rows();
      expect(applyStatusFilter(data, 'all')).toHaveLength(4);
    });

    it('returns the original list when filter is empty/falsy', () => {
      const data = rows();
      expect(applyStatusFilter(data, '')).toHaveLength(4);
      expect(applyStatusFilter(data, null)).toHaveLength(4);
      expect(applyStatusFilter(data, undefined)).toHaveLength(4);
    });

    it('returns only movable when filter="movable"', () => {
      const result = applyStatusFilter(rows(), 'movable');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('movable');
    });

    it('returns only partial when filter="partial"', () => {
      const result = applyStatusFilter(rows(), 'partial');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('partial');
    });

    it('returns empty when no row matches', () => {
      const result = applyStatusFilter(rows(), 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('does not mutate the input array', () => {
      const data = rows();
      applyStatusFilter(data, 'movable');
      expect(data).toHaveLength(4);
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('applySearch', () => {
    it('returns the original list when query is empty', () => {
      expect(applySearch(rows(), '')).toHaveLength(4);
      expect(applySearch(rows(), null)).toHaveLength(4);
      expect(applySearch(rows(), undefined)).toHaveLength(4);
    });

    it('matches by name (case-insensitive)', () => {
      const result = applySearch(rows(), 'VM-PROD');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('vm-prod-01');
    });

    it('matches by type', () => {
      const result = applySearch(rows(), 'sql');
      expect(result).toHaveLength(1);
      expect(result[0].type).toMatch(/Sql/);
    });

    it('matches by resource group', () => {
      const result = applySearch(rows(), 'rg-sec');
      expect(result).toHaveLength(1);
      expect(result[0].resourceGroup).toBe('rg-sec');
    });

    it('matches by location', () => {
      const result = applySearch(rows(), 'eastus');
      expect(result).toHaveLength(2);
    });

    it('returns empty when no row matches', () => {
      expect(applySearch(rows(), 'zzznotfound')).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('applySort', () => {
    it('returns the original list when col is empty/falsy', () => {
      const data = rows();
      expect(applySort(data, '', true)).toEqual(data);
      expect(applySort(data, null, true)).toEqual(data);
    });

    it('sorts by name ascending', () => {
      const result = applySort(rows(), 'name', true);
      expect(result.map(r => r.name)).toEqual([
        'kv-vault-01', 'sql-shared', 'unknown-x', 'vm-prod-01'
      ]);
    });

    it('sorts by name descending', () => {
      const result = applySort(rows(), 'name', false);
      expect(result.map(r => r.name)).toEqual([
        'vm-prod-01', 'unknown-x', 'sql-shared', 'kv-vault-01'
      ]);
    });

    it('sorts by location', () => {
      const result = applySort(rows(), 'location', true);
      expect(result[0].location).toBe('centralus');
    });

    it('does not mutate the input array', () => {
      const data = rows();
      const before = data.map(r => r.name).join(',');
      applySort(data, 'name', true);
      const after = data.map(r => r.name).join(',');
      expect(after).toBe(before);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Bug histórico: export trazia só "movable" quando usuário tinha
  // clicado num stat card. A garantia é arquitetural — as funções
  // são compostas separadamente em getViewData (com filtro) e
  // getExportData (sem filtro). Aqui validamos a propriedade.
  describe('Export vs View contract (regression tests)', () => {
    it('export pipeline (search+sort, NO status filter) keeps all statuses', () => {
      // Simula getExportData: applySort(applySearch(rows, ''), '', true)
      const data = rows();
      const exportResult = applySort(applySearch(data, ''), '', true);
      const statuses = new Set(exportResult.map(r => r.status));
      expect(statuses.has('movable')).toBe(true);
      expect(statuses.has('partial')).toBe(true);
      expect(statuses.has('not-movable')).toBe(true);
      expect(statuses.has('unknown')).toBe(true);
      expect(exportResult).toHaveLength(4);
    });

    it('view pipeline (status+search+sort) reduces when filter is set', () => {
      // Simula getViewData com filter="movable"
      const data = rows();
      const viewResult = applySort(
        applySearch(applyStatusFilter(data, 'movable'), ''),
        '', true
      );
      expect(viewResult).toHaveLength(1);
      expect(viewResult[0].status).toBe('movable');
    });

    it('search applies to both pipelines, status only to view', () => {
      const data = rows();
      // View: filter=movable + search=eastus → 1 (vm-prod)
      const view = applyStatusFilter(applySearch(data, 'eastus'), 'movable');
      expect(view).toHaveLength(1);
      expect(view[0].name).toBe('vm-prod-01');

      // Export: search=eastus apenas → 2 (vm-prod, unknown-x)
      const exp = applySearch(data, 'eastus');
      expect(exp).toHaveLength(2);
    });
  });
});
