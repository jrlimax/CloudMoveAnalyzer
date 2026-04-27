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

1. Add translations to `js/i18n.js` for the new locale code
2. Add a flag entry in `index.html` language switcher
3. Add the locale to `og:locale:alternate` meta tags
4. Test with `lang=xx-YY` URL parameter

## Updating the Move Support Database

The database in `js/move-database.js` is fetched live from
[tfitzmac/resource-capabilities](https://github.com/tfitzmac/resource-capabilities)
on each page load. The embedded copy is a **fallback only**.

If you need to refresh the embedded fallback, copy the latest CSV from
that repository into the `MOVE_DB_RAW` constant.

## Questions?

Open a discussion or reach out via the contact info on
[cloudmoveanalyzer.com](https://cloudmoveanalyzer.com).
