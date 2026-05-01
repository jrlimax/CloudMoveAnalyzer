# Cloud Move Analyzer

[![CI](https://github.com/jrlimax/CloudMoveAnalyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/jrlimax/CloudMoveAnalyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://cloudmoveanalyzer.com)

> Free tool to check Azure resource move support — verify which resources can be migrated between subscriptions, resource groups, and regions.

🌐 **Live site:** [cloudmoveanalyzer.com](https://cloudmoveanalyzer.com)

## ✨ Features

- 📤 Upload Azure CSV/XLSX exports — no setup required
- 🔍 Instant analysis against Microsoft's official move support documentation
- 🌍 8 languages: English, Português, Español, Français, 中文, العربية, Русский, 日本語
- 🔒 100% client-side — your data never leaves your browser
- 📊 Filter, search, sort and export results to **CSV**, **Markdown** or **PDF**
- 🧩 Column picker — show/hide any table column (exports respect selection)
- 📝 Contextual migration notes with links to Microsoft docs per resource type
- 🔄 Database auto-updated weekly from [Microsoft official docs](https://github.com/MicrosoftDocs/azure-docs)
- 💯 Free, open-source, no signup required

## 📁 Project Structure

```
cloudmoveanalyzer/
├── index.html                     # Main page
├── robots.txt                     # SEO
├── sitemap.xml                    # SEO
│
├── css/                           # Stylesheets (source)
├── js/                            # JavaScript (source)
├── assets/                        # Static assets (logo, images)
│
├── scripts/                       # Automation utilities (PowerShell)
│   ├── minify.ps1                 # Generates dist/*.min.{css,js}
│   ├── test-database.ps1          # Database integrity validator
│   └── update-database.ps1        # Refresh DB from Microsoft official docs
│
├── tests/                         # Test suite
│   ├── unit/                      # Vitest unit tests
│   ├── fixtures/                  # Sample CSV files
│   └── helpers/                   # Test utilities
│
├── .github/workflows/             # CI/CD pipelines
│   ├── ci.yml                     # Tests + lint
│   └── update-database.yml        # Weekly DB refresh from MS docs (auto-PR)
│
├── dist/                          # Build output (gitignored)
│
├── package.json                   # npm scripts and dev dependencies
├── vitest.config.js               # Test runner config
├── .editorconfig                  # Editor consistency
├── .gitattributes                 # Git EOL/binary rules
├── LICENSE                        # MIT
├── SECURITY.md                    # Security policy
├── CHANGELOG.md                   # Version history
└── CONTRIBUTING.md                # Contribution guide
```

## 🧪 Testing

| Test Type | Tool | Files | Status |
|---|---|---|---|
| Database Integrity | PowerShell | [scripts/test-database.ps1](scripts/test-database.ps1) | ✅ 13 tests |
| Database Unit Tests | Vitest | [tests/unit/database.test.js](tests/unit/database.test.js) | ✅ 13 tests |
| Move Engine Tests | Vitest | [tests/unit/move-engine.test.js](tests/unit/move-engine.test.js) | ✅ 14 tests |

CI runs automatically on every push and pull request via [GitHub Actions](.github/workflows/ci.yml).

## 🔧 Tech Stack

- **Frontend:** Vanilla JavaScript, CSS3 (no framework)
- **CSV/XLSX Parsing:** [SheetJS](https://sheetjs.com)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com)
- **Testing:** [Vitest](https://vitest.dev) + PowerShell
- **CI/CD:** GitHub Actions

## 🔒 Security

- Strict Content-Security-Policy headers
- HSTS with preload
- All processing happens in-browser (no server-side data handling)
- Security headers configured in Cloudflare Pages build settings

## 📜 License

[MIT](LICENSE) © Jose Roberto Alves Lima

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.
