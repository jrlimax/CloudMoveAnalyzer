#!/usr/bin/env node
// ======================================================================
// Build + Minificacao - Cloud Move Analyzer
// Uso: node scripts/build.js  (ou: npm run build)
// Constroi .cf-dist/ com arquivos minificados prontos para deploy.
// Funciona em qualquer OS (Windows, Linux, macOS).
// ======================================================================

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, '..');
const dist      = join(root, '.cf-dist');

// -----------------------------------------------------------------------
// Minificador CSS
// -----------------------------------------------------------------------
function minifyCss(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')        // remove comentarios
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')    // remove espacos ao redor de simbolos
    .replace(/;}/g, '}')                      // remove ; antes de }
    .replace(/\s+/g, ' ')                     // colapsa espacos multiplos
    .trim();
}

// -----------------------------------------------------------------------
// Minificador JS (conservador — sem AST, seguro para este projeto)
// -----------------------------------------------------------------------
function minifyJs(src) {
  // Remove comentarios multilinha (preserva /*! para licencas)
  src = src.replace(/\/\*(?!!)([\s\S]*?)\*\//g, '');

  // Remove comentarios de linha respeitando strings e template literals
  const lines = src.split('\n');
  const cleaned = [];
  for (let line of lines) {
    let inStr = false;
    let strChar = '';
    let commentIdx = -1;
    for (let i = 0; i < line.length - 1; i++) {
      const c = line[i];
      if (!inStr && (c === '"' || c === "'" || c === '`')) {
        inStr = true; strChar = c;
      } else if (inStr && c === strChar && line[i - 1] !== '\\') {
        inStr = false;
      } else if (!inStr && c === '/' && line[i + 1] === '/') {
        commentIdx = i; break;
      }
    }
    const trimmed = (commentIdx >= 0 ? line.slice(0, commentIdx) : line).trimEnd();
    if (trimmed !== '') cleaned.push(trimmed);
  }

  let result = cleaned.join('\n');

  // Remove indentacao inicial de cada linha
  result = result.replace(/^[ \t]+/gm, '');

  // Remove espacos ao redor de operadores (conservador)
  result = result.replace(/[ \t]*([{}();,:=<>+\-*/&|!?])[ \t]*/g, '$1');

  // Restaura espaco obrigatorio apos palavras-chave
  const keywords = ['return','var','let','const','function','typeof','new',
                    'delete','in','of','instanceof','throw','await','async',
                    'yield','else','case','void'];
  for (const kw of keywords) {
    result = result.replace(new RegExp(`\\b${kw}\\b(?=[a-zA-Z_$])`, 'g'), `${kw} `);
  }

  return result;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function sizeKb(str) {
  return (Buffer.byteLength(str, 'utf8') / 1024).toFixed(1);
}

function processFile(inputPath, outputPath, type) {
  if (!existsSync(inputPath)) {
    console.warn(`  AVISO  Nao encontrado: ${inputPath}`);
    return;
  }
  const original  = readFileSync(inputPath, 'utf8');
  const minified  = type === 'css' ? minifyCss(original) : minifyJs(original);
  const origKb    = sizeKb(original);
  const minKb     = sizeKb(minified);
  const savings   = (100 - (minKb / origKb) * 100).toFixed(1);
  const name      = inputPath.split(/[\\/]/).pop().padEnd(25);
  writeFileSync(outputPath, minified, { encoding: 'utf8' });
  console.log(`  OK  ${name} ${String(origKb).padStart(8)} KB -> ${String(minKb).padStart(8)} KB  (-${savings}%)`);
}

// -----------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------

// Reconstroi .cf-dist/ do zero
if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'css'), { recursive: true });
mkdirSync(join(dist, 'js'),  { recursive: true });

// Copia assets estaticos
cpSync(join(root, 'index.html'),  join(dist, 'index.html'));
cpSync(join(root, 'robots.txt'),  join(dist, 'robots.txt'));
cpSync(join(root, 'sitemap.xml'), join(dist, 'sitemap.xml'));
cpSync(join(root, 'assets'),      join(dist, 'assets'), { recursive: true });

console.log('\nIniciando minificacao -> .cf-dist/\n');

// CSS
console.log('CSS:');
processFile(join(root, 'css', 'style.css'), join(dist, 'css', 'style.css'), 'css');

// JS
console.log('\nJavaScript:');
for (const js of ['app.js', 'i18n.js', 'move-database.js', 'set-lang.js']) {
  processFile(join(root, 'js', js), join(dist, 'js', js), 'js');
}

console.log('\nBuild concluido em .cf-dist/');
console.log('Proximo passo: npx wrangler deploy\n');
