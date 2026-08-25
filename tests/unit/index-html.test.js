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

describe('index.html encoding guard (mojibake regression)', () => {
  // index.html is English + HTML entities; â/Ã/ð only ever appear when UTF-8
  // bytes get re-decoded as Windows-1252 (e.g. "â ¿" instead of "⠿").
  it('contains no mojibake indicator characters', () => {
    const mojibake = html.match(/[âÃð\uFFFD]/g);
    expect(mojibake, `Mojibake found: ${JSON.stringify(mojibake)}`).toBeNull();
  });

  it('declares UTF-8 charset', () => {
    expect(html).toMatch(/<meta charset="UTF-8"\s*\/?>/i);
  });
});

describe('index.html SEO metadata', () => {
  it('has Open Graph tags (title, description, url, image, type)', () => {
    for (const prop of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
      expect(html, `Missing ${prop}`).toMatch(new RegExp(`property="${prop}"`));
    }
  });

  it('has Twitter Card tags', () => {
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(html, `Missing ${name}`).toMatch(new RegExp(`name="${name}"`));
    }
  });

  it('has valid JSON-LD blocks including FAQPage and WebApplication', () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => m[1]);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const types = blocks.map(b => JSON.parse(b)['@type']); // JSON.parse also validates syntax
    expect(types).toContain('WebApplication');
    expect(types).toContain('FAQPage');
  });

  it('FAQPage JSON-LD question count matches the visible FAQ <details> count', () => {
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => JSON.parse(m[1]))
      .find(b => b['@type'] === 'FAQPage');
    const visibleFaqs = (html.match(/<details id="faq-/g) || []).length;
    expect(faq.mainEntity.length).toBe(visibleFaqs);
  });

  it('references the web app manifest', () => {
    expect(html).toMatch(/rel="manifest"/);
  });

  it('preload ?v= versions match their <script src> counterparts', () => {
    const preloads = [...html.matchAll(/rel="preload" as="script" href="([^"]+)"/g)].map(m => m[1]);
    for (const href of preloads) {
      expect(html, `Preloaded ${href} has no matching <script> with same version`)
        .toContain(`<script src="${href}"`);
    }
  });
});
