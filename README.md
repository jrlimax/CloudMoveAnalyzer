# Cloud Move Analyzer

[![CI](https://github.com/jrlimax/CloudMoveAnalyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/jrlimax/CloudMoveAnalyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static%20Web%20Apps-0078D4?logo=microsoftazure)](https://cloudmoveanalyzer.com)

> Free tool to check Azure resource move support — verify which resources can be migrated between subscriptions, resource groups, and regions.

🌐 **Live site:** [cloudmoveanalyzer.com](https://cloudmoveanalyzer.com)

## ✨ Features

- 📤 Upload Azure CSV/XLSX exports — no setup required
- 🔍 Instant analysis against Microsoft's official move support documentation
- 🌍 8 languages: English, Português, Español, Français, 中文, العربية, Русский, 日本語
- 🔒 100% client-side — your data never leaves your browser
- 📊 Filter, search, sort and export results to CSV
- 🔄 Database auto-updated weekly from [Microsoft official docs](https://github.com/MicrosoftDocs/azure-docs)
- 💯 Free, open-source, no signup required

## 📁 Project Structure

```
cloudmoveanalyzer/
├── index.html                     # Main page
├── staticwebapp.config.json       # Azure Static Web Apps config (CSP, headers, cache)
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
│   ├── update-database.yml        # Weekly DB refresh from MS docs (auto-PR)
│   └── azure-static-web-apps-*.yml  # Auto-deploy
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
- **Hosting:** [Azure Static Web Apps](https://azure.microsoft.com/products/app-service/static)
- **Testing:** [Vitest](https://vitest.dev) + PowerShell
- **CI/CD:** GitHub Actions

## 🔒 Security

- Strict Content-Security-Policy headers
- HSTS with preload
- All processing happens in-browser (no server-side data handling)
- See [staticwebapp.config.json](staticwebapp.config.json) for full security headers

## 📜 License

[MIT](LICENSE) © Jose Roberto Alves Lima

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.
