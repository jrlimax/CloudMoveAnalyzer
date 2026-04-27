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
- 🔄 Live database refresh from [tfitzmac/resource-capabilities](https://github.com/tfitzmac/resource-capabilities)
- 💯 Free, open-source, no signup required

## 📁 Project Structure

```
cloudmoveanalyzer/
├── index.html                    # Main page
├── staticwebapp.config.json      # Azure Static Web Apps config
├── robots.txt                    # SEO
├── sitemap.xml                   # SEO
│
├── css/                          # Stylesheets (source + minified)
├── js/                           # JavaScript modules (source + minified)
├── assets/                       # Static assets (logo, QR code)
│
├── scripts/                      # Automation utilities
│   ├── minify.ps1                # CSS/JS minification (PowerShell)
│   └── test-database.ps1         # Database integrity validator
│
├── tests/                        # Test suite
│   ├── unit/                     # Vitest unit tests
│   ├── fixtures/                 # Sample CSV files for testing
│   └── helpers/                  # Test utilities
│
├── .github/workflows/            # CI/CD pipelines
│   ├── ci.yml                    # Tests + lint
│   └── azure-static-web-apps-*.yml  # Auto-deploy
│
├── package.json                  # npm scripts and dev dependencies
├── vitest.config.js              # Test runner config
├── .editorconfig                 # Editor consistency
├── LICENSE                       # MIT
├── CHANGELOG.md                  # Version history
└── CONTRIBUTING.md               # Contribution guide
```

## 🚀 Quick Start

### Run Locally

```bash
# Any static server works — pick one:
npx serve .
# or
python -m http.server 8000
# or use VS Code "Live Server" extension
```

Open http://localhost:3000 (or 8000) in your browser.

### Run Tests

```powershell
# Database integrity check (PowerShell - no Node.js required)
.\scripts\test-database.ps1
# or via npm:
npm run test:db

# Full unit test suite (requires Node.js)
npm install
npm test
npm run test:coverage
```

### Build (Minify Assets)

```powershell
# Generates *.min.css and *.min.js files
.\scripts\minify.ps1
# or via npm:
npm run minify
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

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on:

- How to report bugs
- How to suggest features
- How to submit pull requests
- Coding standards

## 📜 License

[MIT](LICENSE) © Jose Roberto Alves Lima

## 🙏 Credits

- Move support data: [tfitzmac/resource-capabilities](https://github.com/tfitzmac/resource-capabilities)
- Country flags: [flagcdn.com](https://flagcdn.com)
- Donation widget: [Ko-fi](https://ko-fi.com)

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.
