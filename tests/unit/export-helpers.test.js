/**
 * Tests for the render/export helper functions:
 *
 *   - escapeHtml(str)   → HTML-escapes every dynamic value before it reaches
 *                         innerHTML (the core XSS defense).
 *   - safeHttpUrl(url)  → only lets http(s) URLs through, so a malicious
 *                         `javascript:` / `data:` href can never be rendered.
 *   - computeSummary()  → the shared status counter used by the stats cards
 *                         and the CSV/PDF exports.
 *
 * These are pure functions, extracted straight from js/app.js so the tests
 * guard the real production code (not a copy).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadExportHelpers } from '../helpers/load-source.js';

describe('Export & render helpers', () => {
  let escapeHtml, safeHttpUrl, computeSummary;

  beforeAll(() => {
    ({ escapeHtml, safeHttpUrl, computeSummary } = loadExportHelpers());
  });

  // ──────────────────────────────────────────────────────────
  describe('escapeHtml', () => {
    it('escapes the five HTML-significant characters', () => {
      expect(escapeHtml('&')).toBe('&amp;');
      expect(escapeHtml('<')).toBe('&lt;');
      expect(escapeHtml('>')).toBe('&gt;');
      expect(escapeHtml('"')).toBe('&quot;');
      expect(escapeHtml("'")).toBe('&#39;');
    });

    it('neutralizes a script-tag injection attempt', () => {
      const evil = '<script>alert(1)</script>';
      const out = escapeHtml(evil);
      expect(out).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(out).not.toContain('<script>');
    });

    it('neutralizes an attribute-breakout attempt', () => {
      const evil = '" onmouseover="alert(1)';
      const out = escapeHtml(evil);
      expect(out).not.toContain('"');
      expect(out).toContain('&quot;');
    });

    it('escapes ampersands before other entities (no double-decoding)', () => {
      expect(escapeHtml('&lt;')).toBe('&amp;lt;');
    });

    it('coerces null/undefined to an empty string', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('coerces non-string values via String()', () => {
      expect(escapeHtml(42)).toBe('42');
      expect(escapeHtml(0)).toBe('0');
    });

    it('leaves plain text untouched', () => {
      expect(escapeHtml('Microsoft.Compute/virtualMachines')).toBe(
        'Microsoft.Compute/virtualMachines'
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('safeHttpUrl', () => {
    it('allows https URLs', () => {
      const url = 'https://learn.microsoft.com/en-us/azure/';
      expect(safeHttpUrl(url)).toBe(url);
    });

    it('allows http URLs', () => {
      expect(safeHttpUrl('http://example.com')).toBe('http://example.com');
    });

    it('is case-insensitive on the scheme', () => {
      expect(safeHttpUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
    });

    it('trims surrounding whitespace', () => {
      expect(safeHttpUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('rejects javascript: URLs', () => {
      expect(safeHttpUrl('javascript:alert(1)')).toBe('');
    });

    it('rejects data: URLs', () => {
      expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('rejects vbscript: URLs', () => {
      expect(safeHttpUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('rejects protocol-relative and relative URLs', () => {
      expect(safeHttpUrl('//evil.com')).toBe('');
      expect(safeHttpUrl('/local/path')).toBe('');
    });

    it('rejects non-string input', () => {
      expect(safeHttpUrl(null)).toBe('');
      expect(safeHttpUrl(undefined)).toBe('');
      expect(safeHttpUrl(123)).toBe('');
      expect(safeHttpUrl({})).toBe('');
    });
  });

  // ──────────────────────────────────────────────────────────
  describe('computeSummary', () => {
    const rows = () => [
      { status: 'movable' },
      { status: 'movable' },
      { status: 'partial' },
      { status: 'not-movable' },
      { status: 'unknown' },
    ];

    it('counts each status correctly', () => {
      const s = computeSummary(rows());
      expect(s.total).toBe(5);
      expect(s.movable).toBe(2);
      expect(s.partial).toBe(1);
      expect(s.notMovable).toBe(1);
      expect(s.unknown).toBe(1);
    });

    it('computes rounded percentages against the total', () => {
      const s = computeSummary(rows());
      expect(s.movablePct).toBe(40); // 2/5
      expect(s.partialPct).toBe(20); // 1/5
      expect(s.notMovPct).toBe(20); // 1/5
    });

    it('treats any unrecognized status as unknown', () => {
      const s = computeSummary([{ status: 'weird' }, { status: '' }, {}]);
      expect(s.unknown).toBe(3);
      expect(s.movable).toBe(0);
    });

    it('returns zeroed percentages for an empty list (no divide-by-zero)', () => {
      const s = computeSummary([]);
      expect(s.total).toBe(0);
      expect(s.movablePct).toBe(0);
      expect(s.partialPct).toBe(0);
      expect(s.notMovPct).toBe(0);
    });

    it('rounds percentages to the nearest integer', () => {
      // 1 movable out of 3 → 33.33% → 33
      const s = computeSummary([
        { status: 'movable' },
        { status: 'partial' },
        { status: 'partial' },
      ]);
      expect(s.movablePct).toBe(33);
      expect(s.partialPct).toBe(67); // 2/3 → 66.66 → 67
    });
  });
});
