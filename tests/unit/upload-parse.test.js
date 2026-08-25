import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadUploadFunctions } from '../helpers/load-source.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, '..', 'fixtures');

const { detectSpreadsheetFormat, readWorkbook } = loadUploadFunctions();

function bufFrom(bytes) {
  return Uint8Array.from(bytes).buffer;
}

function bufFromText(text) {
  return new TextEncoder().encode(text).buffer;
}

describe('detectSpreadsheetFormat (magic-byte sniffing)', () => {
  it('detects XLSX (zip, PK\\x03\\x04) regardless of file extension', () => {
    expect(detectSpreadsheetFormat(Uint8Array.from([0x50, 0x4B, 0x03, 0x04]))).toBe('zip');
  });

  it('detects empty-zip variant (PK\\x05\\x06)', () => {
    expect(detectSpreadsheetFormat(Uint8Array.from([0x50, 0x4B, 0x05, 0x06]))).toBe('zip');
  });

  it('detects legacy XLS (compound file binary)', () => {
    expect(detectSpreadsheetFormat(Uint8Array.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]))).toBe('cfb');
  });

  it('treats plain CSV text as text', () => {
    const head = new TextEncoder().encode('NAME,TYP');
    expect(detectSpreadsheetFormat(head)).toBe('text');
  });

  it('treats an empty buffer as text (falls through to CSV parsing)', () => {
    expect(detectSpreadsheetFormat(new Uint8Array(0))).toBe('text');
  });
});

describe('readWorkbook (content-based parse routing)', () => {
  it('routes zip content to XLSX.read with type array — the ".csv that is really an .xlsx" case', () => {
    const wb = readWorkbook(bufFrom([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]));
    expect(wb.opts).toEqual({ type: 'array' });
    expect(wb.data).toBeInstanceOf(Uint8Array);
  });

  it('routes CFB content to XLSX.read with type array', () => {
    const wb = readWorkbook(bufFrom([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]));
    expect(wb.opts).toEqual({ type: 'array' });
  });

  it('routes CSV text to XLSX.read with type string', () => {
    const wb = readWorkbook(bufFromText('NAME,TYPE\n"vm1","Virtual machine"\n'));
    expect(wb.opts).toEqual({ type: 'string' });
    expect(wb.data).toContain('NAME,TYPE');
  });

  it('strips the UTF-8 BOM from CSV text', () => {
    const wb = readWorkbook(bufFromText('\uFEFFNAME,TYPE\n'));
    expect(wb.data.charCodeAt(0)).not.toBe(0xFEFF);
    expect(wb.data.startsWith('NAME,TYPE')).toBe(true);
  });

  it('rejects unknown binary content (NUL bytes) with a clear error', () => {
    expect(() => readWorkbook(bufFrom([0x4E, 0x41, 0x00, 0x4D, 0x45]))).toThrow(/binary/);
  });

  it('parses the real Azure export fixture as text', () => {
    const bytes = readFileSync(resolve(FIXTURES, 'azure-export-small.csv'));
    const wb = readWorkbook(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    expect(wb.opts).toEqual({ type: 'string' });
    expect(wb.data).toMatch(/NAME|Name/);
  });
});
