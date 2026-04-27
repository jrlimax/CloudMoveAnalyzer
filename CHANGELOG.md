# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-04-27

### Added
- Export to **PDF** (via hidden iframe print)
- Export to **Markdown** (.md table format)
- **Column picker** — toggle visibility of any table column
- Pill-shaped gradient export buttons (CSV green, PDF red, MD purple) with SVG icons
- Two-row toolbar layout: search row + actions row (columns + exports)
- `MOVE_NOTES` map with contextual migration notes for 30+ resource types
- Notes column in results table with doc links per resource type
- `exportLabel`, `exportPdfBtn`, `exportMdBtn`, `colPickerBtn` i18n keys (all 8 languages)
- Cache-busting query strings (`?v=2`) on all local CSS/JS references

### Fixed
- `localStorage` crash in Safari private mode — wrapped in try/catch
- Filters not resetting when uploading a new file (`currentFilter`, `currentSearch`, `sortCol`)
- Sort arrow indicators now update correctly on column click

### Changed
- Export CSV/MD/PDF now respect column picker visibility via `getExportCols()`
- GitHub Actions updated: `actions/checkout` v4→v5, `actions/setup-node` v4→v5, Node.js 20→22

### Removed
- Dead `.export-btn` CSS (replaced by `.export-pill`)

## [1.2.0] - 2026-04-27

### Added
- `SECURITY.md`: vulnerability disclosure policy
- `.gitattributes`: consistent EOL handling across platforms
- `scripts/update-database.ps1`: parses official Microsoft markdown docs and refreshes `MOVE_DB_RAW`
- `.github/workflows/update-database.yml`: weekly auto-update (cron) opening a PR when data changes
- Project structure: `LICENSE` (MIT), `.editorconfig`, `package.json`, `CONTRIBUTING.md`, `CHANGELOG.md`
- `scripts/` folder for automation utilities
- `tests/` folder with Vitest test suite (unit + integrity tests)
- GitHub Actions workflow for CI testing
- Database integrity validator (PowerShell, no Node required)

### Changed
- `scripts/minify.ps1`: now writes to `dist/` (gitignored) instead of next to source files
- Database source switched from third-party `tfitzmac/resource-capabilities` to **official `MicrosoftDocs/azure-docs`**
- Database refresh strategy: was live `fetch()` on page load, now offline auto-update via GitHub Actions
- Moved `minify.ps1` from root to `scripts/`

### Removed
- Tracked `*.min.css` / `*.min.js` files (now gitignored, regenerated on demand)
- Live `fetch()` IIFE in `js/move-database.js` (`MOVE_DB_LIVE_URL`, `moveDbSource`, `refreshMoveDB`)
- Third-party dependency on `tfitzmac/resource-capabilities`

## [1.1.0] - 2026-04-27

### Added
- Minified asset variants (`*.min.css`, `*.min.js`) — CSS -38%, JS -32%
- `minify.ps1` PowerShell script for asset minification
- Schema.org `BreadcrumbList` structured data for SEO
- `prefers-reduced-motion` CSS media query (accessibility)
- `loading="lazy"` and `decoding="async"` on non-critical images
- `fetchpriority="high"` on the logo for better LCP
- Cache-Control headers for `/css/*` and `/js/*` routes (7 days)

### Performance
- Reduced total CSS+JS payload by ~17 KB
- Improved Largest Contentful Paint via fetchpriority hint
- Reduced layout shift via explicit width/height on images

## [1.0.0] - 2026-XX-XX

### Added
- Initial release of Cloud Move Analyzer
- CSV/XLSX upload and parsing
- Move support analysis (RG, Subscription, Region)
- 8 language support (EN, PT-BR, ES, FR, ZH-CN, AR, RU, JA)
- Live database from tfitzmac/resource-capabilities
- Export results to CSV
- Filter and search results
- Static Web App deployment via Azure
