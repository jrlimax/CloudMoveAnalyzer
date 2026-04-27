# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Cloud Move Analyzer, please report
it privately. **Do not open a public GitHub issue.**

- Open a [private security advisory](https://github.com/jrlimax/CloudMoveAnalyzer/security/advisories/new) on GitHub, or
- Contact the maintainer through [cloudmoveanalyzer.com](https://cloudmoveanalyzer.com).

We will acknowledge your report within 7 days and aim to provide a fix within
30 days for confirmed vulnerabilities.

## Scope

This project is a 100% client-side static web app. There is no backend, no
database, and no user data is transmitted off the user's browser.

In-scope concerns:

- Cross-Site Scripting (XSS) via uploaded CSV/XLSX content
- Content-Security-Policy bypass
- Dependency vulnerabilities (SheetJS, dev dependencies)
- Issues in the database update workflow

Out of scope:

- Issues affecting only outdated browsers
- Self-XSS that requires the user to paste content into DevTools
- Findings that require a compromised user device

## Supported Versions

Only the latest version (deployed at `cloudmoveanalyzer.com`) is supported.
