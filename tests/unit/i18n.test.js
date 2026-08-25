import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const I18N_DIR = resolve(ROOT, 'js', 'i18n');

// Each pack is a global script: (window.__I18N_DATA__ = ...)["lang"] = { ... }
// Evaluate it with a stubbed window to capture the object.
function loadPack(file) {
  const source = readFileSync(resolve(I18N_DIR, file), 'utf8');
  const sandbox = `
    const window = { __I18N_DATA__: {} };
    ${source}
    return window.__I18N_DATA__;
  `;
  // eslint-disable-next-line no-new-func
  const data = new Function(sandbox)();
  const langs = Object.keys(data);
  if (langs.length !== 1) throw new Error(`${file}: expected exactly one language, got ${langs.join(', ')}`);
  return { lang: langs[0], pack: data[langs[0]] };
}

const files = readdirSync(I18N_DIR).filter(f => f.endsWith('.js'));
const packs = files.map(loadPack);
const en = packs.find(p => p.lang === 'en');

describe('i18n language packs', () => {
  it('has all 8 expected languages', () => {
    const langs = packs.map(p => p.lang).sort();
    expect(langs).toEqual(['ar', 'en', 'es', 'fr', 'ja', 'pt-BR', 'ru', 'zh-CN']);
  });

  it('en pack exists and is non-trivial', () => {
    expect(en).toBeDefined();
    expect(Object.keys(en.pack).length).toBeGreaterThan(20);
  });

  for (const { lang, pack } of packs) {
    if (lang === 'en') continue;

    it(`${lang}: has every key that en has (no missing translations)`, () => {
      const missing = Object.keys(en.pack).filter(k => !(k in pack));
      expect(missing, `Missing keys in ${lang}`).toEqual([]);
    });

    it(`${lang}: has no extra keys absent from en (no orphans)`, () => {
      const extra = Object.keys(pack).filter(k => !(k in en.pack));
      expect(extra, `Orphan keys in ${lang}`).toEqual([]);
    });

    it(`${lang}: no empty translation values`, () => {
      const empty = Object.entries(pack)
        .filter(([, v]) => typeof v === 'string' && v.trim() === '')
        .map(([k]) => k);
      expect(empty, `Empty values in ${lang}`).toEqual([]);
    });
  }
});
