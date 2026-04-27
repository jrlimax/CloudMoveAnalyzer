import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

function extractAttr(regex) {
  const out = [];
  let m;
  while ((m = regex.exec(html)) !== null) out.push(m[1]);
  return out;
}

describe('index.html smoke test', () => {
  it('all local <script src="..."> paths exist on disk', () => {
    const srcs = extractAttr(/<script[^>]+src=["']([^"']+)["']/gi);
    const local = srcs.filter(s => !/^https?:\/\//i.test(s) && !s.startsWith('//'));
    expect(local.length).toBeGreaterThan(0);
    for (const src of local) {
      const clean = src.split('?')[0].replace(/^\//, '');
      expect(existsSync(resolve(ROOT, clean)), `Missing file: ${src}`).toBe(true);
    }
  });

  it('all local <link href="..."> paths exist on disk', () => {
    const hrefs = extractAttr(/<link[^>]+href=["']([^"']+)["']/gi);
    const local = hrefs.filter(h =>
      !/^https?:\/\//i.test(h) &&
      !h.startsWith('//') &&
      !h.startsWith('mailto:') &&
      !h.startsWith('#')
    );
    for (const href of local) {
      const clean = href.split('?')[0].split('#')[0].replace(/^\//, '');
      if (!clean) continue;
      expect(existsSync(resolve(ROOT, clean)), `Missing file: ${href}`).toBe(true);
    }
  });

  it('has a <title>', () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/i);
  });

  it('has lang attribute on <html>', () => {
    expect(html).toMatch(/<html[^>]+lang=/i);
  });
});
