#!/usr/bin/env node
/**
 * build.js — Copies sources to .cf-dist/, then pre-renders per-language pages
 * (/<lang>/index.html) and regenerates sitemap.xml with all language URLs.
 * Cloudflare Pages build command: npm run build
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '.cf-dist');
const SITE = 'https://cloudmoveanalyzer.com';

// Per-language SEO metadata. Body text is still localized at runtime by i18n.js;
// pre-rendering only ensures crawlers see localized <title>/<meta description>
// and the correct <html lang>/canonical/hreflang up front.
const LANGS = [
  {
    code: 'en', slug: 'en', dir: 'ltr', ogLocale: 'en_US',
    title: 'Cloud Move Analyzer — Azure Resource Move Support',
    description: 'Free tool to check Azure resource move support. See which resources can move between subscriptions, RGs, and regions.',
  },
  {
    code: 'pt-BR', slug: 'pt-br', dir: 'ltr', ogLocale: 'pt_BR',
    title: 'Cloud Move Analyzer — Verificador de Mover Recursos do Azure',
    description: 'Ferramenta grátis para checar movimentação de recursos Azure entre assinaturas, grupos de recursos e regiões.',
  },
  {
    code: 'es', slug: 'es', dir: 'ltr', ogLocale: 'es_ES',
    title: 'Cloud Move Analyzer — Verificador de Migración de Recursos Azure',
    description: 'Herramienta gratuita para verificar el movimiento de recursos Azure entre suscripciones, grupos de recursos y regiones.',
  },
  {
    code: 'fr', slug: 'fr', dir: 'ltr', ogLocale: 'fr_FR',
    title: 'Cloud Move Analyzer — Vérificateur de Déplacement de Ressources Azure',
    description: 'Outil gratuit pour vérifier le déplacement des ressources Azure entre abonnements, groupes de ressources et régions.',
  },
  {
    code: 'zh-CN', slug: 'zh-cn', dir: 'ltr', ogLocale: 'zh_CN',
    title: 'Cloud Move Analyzer — Azure 资源移动支持检查工具',
    description: '免费工具，用于检查 Azure 资源在订阅、资源组和区域之间的移动支持情况。',
  },
  {
    code: 'ar', slug: 'ar', dir: 'rtl', ogLocale: 'ar_SA',
    title: 'Cloud Move Analyzer — أداة فحص نقل موارد Azure',
    description: 'أداة مجانية للتحقق من نقل موارد Azure بين الاشتراكات ومجموعات الموارد والمناطق.',
  },
  {
    code: 'ru', slug: 'ru', dir: 'ltr', ogLocale: 'ru_RU',
    title: 'Cloud Move Analyzer — проверка поддержки переноса ресурсов Azure',
    description: 'Бесплатный инструмент для проверки переноса ресурсов Azure между подписками, группами ресурсов и регионами.',
  },
  {
    code: 'ja', slug: 'ja', dir: 'ltr', ogLocale: 'ja_JP',
    title: 'Cloud Move Analyzer — Azure リソース移動サポートチェッカー',
    description: 'Azure リソースをサブスクリプション、リソースグループ、リージョン間で移動できるか確認する無料ツール。',
  },
];

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath  = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else copy(srcPath, destPath);
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Rewrite relative asset URLs so a page served from /<lang>/ still loads
// /css /js /assets from the site root.
function absolutizeAssetPaths(html) {
  return html.replace(/(href|src)="(css|js|assets)\//g, '$1="/$2/');
}

function buildHreflangBlock() {
  const lines = [`  <link rel="alternate" hreflang="x-default" href="${SITE}/" />`];
  for (const l of LANGS) {
    lines.push(`  <link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.slug}/" />`);
  }
  return lines.join('\n');
}

function renderLangPage(template, lang) {
  const canonical   = `${SITE}/${lang.slug}/`;
  const title       = escapeHtml(lang.title);
  const description = escapeHtml(lang.description);
  let html = template;

  html = html.replace(/<html\s+lang="[^"]*"[^>]*>/i, `<html lang="${lang.code}" dir="${lang.dir}">`);

  // Inject pre-render language marker BEFORE set-lang.js so first paint matches the URL locale.
  html = html.replace(
    /<script src="js\/set-lang\.js[^"]*"><\/script>/,
    (m) => `<script>window.__CMA_LANG__=${JSON.stringify(lang.code)};</script>\n  ${m}`
  );

  // Replace the default i18n data pack (en) with this page's language pack
  // (plus en as a fallback, when different). Same for the matching preload hint.
  if (lang.code !== 'en') {
    html = html.replace(
      /<link rel="preload" as="script" href="js\/i18n\/en\.js\?v=\d+" \/>/,
      (m) => `${m}\n  <link rel="preload" as="script" href="js/i18n/${lang.code}.js?v=1" />`
    );
    html = html.replace(
      /<script src="js\/i18n\/en\.js\?v=\d+" defer><\/script>/,
      (m) => `${m}\n  <script src="js/i18n/${lang.code}.js?v=1" defer></script>`
    );
  }

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`
  );

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${canonical}" id="canonicalLink" />`
  );

  // Replace existing hreflang block with a fresh one. Keep the leading comment.
  html = html.replace(
    /(<!-- Hreflang:[\s\S]*?-->)\s*([\s\S]*?)(?=\n\s*<!-- Open Graph -->)/,
    (_m, comment) => `${comment}\n${buildHreflangBlock()}\n`
  );

  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${lang.ogLocale}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${description}" />`
  );

  return absolutizeAssetPaths(html);
}

function buildSitemap(today) {
  const alternates = [
    `      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
    ...LANGS.map(l => `      <xhtml:link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.slug}/" />`),
  ].join('\n');

  const urls = [
    { loc: `${SITE}/`,    priority: '1.0' },
    ...LANGS.map(l => ({ loc: `${SITE}/${l.slug}/`, priority: '0.9' })),
  ];

  const entries = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
${alternates}
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// Regenerate per-language i18n packs from data/i18n-source.js before copying js/
// (so .cf-dist/js/i18n/<lang>.js is always in sync with the canonical source).
const split = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'split-i18n.js')], { stdio: 'inherit' });
if (split.status !== 0) throw new Error('split-i18n.js failed');

// Root files (sitemap.xml is regenerated below, so skip copying it)
for (const file of ['index.html', 'robots.txt', '_headers', 'ads.txt']) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) copy(src, path.join(DIST, file));
}

copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
copyDir(path.join(ROOT, 'css'),    path.join(DIST, 'css'));
copyDir(path.join(ROOT, 'js'),     path.join(DIST, 'js'));

const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const lang of LANGS) {
  const outDir = path.join(DIST, lang.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), renderLangPage(template, lang), 'utf8');
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), buildSitemap(today), 'utf8');

console.log(`Build complete → .cf-dist/  (${LANGS.length} language pages, sitemap lastmod=${today})`);
