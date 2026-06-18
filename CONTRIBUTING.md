# Contributing to Cloud Move Analyzer

Thanks for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

Open an [issue](https://github.com/jrlimax/CloudMoveAnalyzer/issues) including:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- A sample CSV/XLSX file (if relevant — anonymized)

### Suggesting Features

Open a [discussion](https://github.com/jrlimax/CloudMoveAnalyzer/discussions) describing:

- The problem you're trying to solve
- Your proposed solution
- Use cases

### Submitting Pull Requests

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feat/my-feature`
3. Make your changes
4. **Run tests**: `npm test`
5. **Run minification** if you changed CSS/JS: `npm run minify`
6. **Commit** following [Conventional Commits](https://www.conventionalcommits.org/)
7. **Push** and open a Pull Request

## Local Development

```bash
# Clone
git clone https://github.com/jrlimax/CloudMoveAnalyzer.git
cd CloudMoveAnalyzer

# Install dev dependencies (optional, only for tests)
npm install

# Serve locally (any static server works)
npm run serve

# Run tests
npm test

# Run database integrity check (PowerShell, no Node required)
npm run test:db
```

## Coding Standards

- **Indentation:** 2 spaces (see [.editorconfig](.editorconfig))
- **Line endings:** LF (CRLF for `.ps1`)
- **Encoding:** UTF-8
- **Comments:** Bilingual (EN/PT-BR) accepted in code

## Adding a New Language

Strings are sourced from `data/i18n-source.js` (canonical) and split into
per-language bundles under `js/i18n/<lang>.js` by `scripts/split-i18n.js`.
**Never edit `js/i18n/*.js` by hand — they are generated.**

1. Open `data/i18n-source.js` and add the new locale entry inside the `I18N`
   object (clone the `en:` block as a starting point and translate values).
2. Add the locale to the `LANGS` array in `scripts/build.js` (controls
   pre-rendered `/<lang>/` pages and sitemap entries).
3. Add a flag PNG under `assets/flags/` (24×18 is the standard size used in the
   header / language picker).
4. Add the picker `<li>` in `index.html` and a flag entry in `LANG_FLAGS` in
   `js/app.js`.
5. Regenerate the per-language packs:
   ```bash
   node scripts/split-i18n.js
   ```
6. Add the locale to `og:locale:alternate` and `hreflang` lists in `index.html`.
7. Run `npm test` and `npm run build` to verify the pipeline.

## Updating the Icon Map

Resource-type → icon mappings live in `data/icon-map.json` (curated, hand-edited)
and the generated `js/icon-map.js`.

1. Edit `data/icon-map.json` to add or correct mappings.
2. Regenerate: `node scripts/build-icon-map.js`.
3. (Optional) Refresh the Portal icon snapshot and reconcile:
   ```bash
   node scripts/sync-portal-icons.js     # updates data/portal-icon-snapshot.json
   node scripts/reconcile-icons.js       # generates data/icon-map.suggested.json
   ```
4. Run tests: `npm test`.

## Optimizing Images

Run after replacing any of `assets/logo.png`, `assets/og-image.png`, or
`assets/favicon.png`:

```powershell
.\scripts\optimize-images.ps1
```

Originals are backed up under `assets/_originals/` (gitignored).

## Updating the Move Support Database

The database in `js/move-database.js` is auto-updated weekly from the
[official Microsoft docs](https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/azure-resource-manager/management/move-support-resources.md)
via the GitHub Actions workflow at `.github/workflows/update-database.yml`.

To update manually, run:

```powershell
.\scripts\update-database.ps1
```

## Build Pipeline

`npm run build` (alias for `node scripts/build.js`) does the following in order:

1. Wipes `.cf-dist/`
2. Runs `scripts/split-i18n.js` (regenerates `js/i18n/<lang>.js`)
3. Copies `index.html`, `robots.txt`, `_headers`, `assets/`, `css/`, `js/`
4. Pre-renders one `/<lang>/index.html` per language (localized title/meta/og,
   injects per-language i18n bundle + matching preload)
5. Regenerates `sitemap.xml` with current `lastmod`

## Questions?

Open a discussion or reach out via the contact info on
[cloudmoveanalyzer.com](https://cloudmoveanalyzer.com).
