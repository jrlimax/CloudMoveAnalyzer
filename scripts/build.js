#!/usr/bin/env node
/**
 * build.js — Simple file copy to .cf-dist/ (no minification).
 * Cloudflare Pages build command: npm run build
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '.cf-dist');

function copy(src, dest) {
  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath  = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copy(srcPath, destPath);
    }
  }
}

// Clean dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// Root files
for (const file of ['index.html', 'robots.txt', 'sitemap.xml']) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) copy(src, path.join(DIST, file));
}

// Directories
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
copyDir(path.join(ROOT, 'css'),    path.join(DIST, 'css'));
copyDir(path.join(ROOT, 'js'),     path.join(DIST, 'js'));

console.log('Build complete → .cf-dist/');
