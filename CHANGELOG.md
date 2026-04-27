# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `scripts/update-database.ps1`: parses official Microsoft markdown docs and refreshes `MOVE_DB_RAW`
- `.github/workflows/update-database.yml`: weekly auto-update (cron) opening a PR when data changes
- Project structure: `LICENSE` (MIT), `.editorconfig`, `package.json`, `CONTRIBUTING.md`, `CHANGELOG.md`
- `scripts/` folder for automation utilities
- `tests/` folder with Vitest test suite (unit + integrity tests)
- GitHub Actions workflow for CI testing
- Database integrity validator (PowerShell, no Node required)

### Changed
- Database source switched from third-party `tfitzmac/resource-capabilities` to **official `MicrosoftDocs/azure-docs`**
- Database refresh strategy: was live `fetch()` on page load, now offline auto-update via GitHub Actions

### Removed
- Live `fetch()` IIFE in `js/move-database.js` (`MOVE_DB_LIVE_URL`, `moveDbSource`, `refreshMoveDB`)
- Third-party dependency on `tfitzmac/resource-capabilities`

### Changed
- Moved `minify.ps1` from root to `scripts/`

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
