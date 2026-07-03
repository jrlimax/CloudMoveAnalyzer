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

## Hardening summary

What we currently do (defense-in-depth):

- **No server, no telemetry, no user data leaves the browser.** Uploads are
  parsed in-memory via `FileReader`; no `fetch`/`XMLHttpRequest` ever sends
  user data to any origin.
- **HTTP response headers** (see `_headers`): HSTS preload, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy (camera/mic/geo/FLoC denied), X-Frame-Options,
  COOP `same-origin`, CORP `same-origin`, COEP `credentialless`, and a strict
  **Content-Security-Policy** (enforced; `unsafe-inline` removed from `script-src`).
  All inline scripts eliminated via `<html data-cma-lang>` attribute.
- **Upload validation** before parsing: extension allow-list (csv/tsv/xls/xlsx),
  size cap (10 MB), and magic-byte sniffing (`PK\x03\x04` for zip-based xlsx,
  `D0 CF 11 E0` for legacy xls) to refuse mis-typed binaries.
- **HTML escaping** on every dynamic insertion (`escapeHtml()` is mandatory for
  every value rendered via template literals into `innerHTML`).
- **Anchor href hardening**: `safeHttpUrl()` only allows `http(s)://` schemes
  before any URL is placed in a rendered `href`, defeating `javascript:`/`data:`
  injection paths.
- **External link hygiene**: every `target="_blank"` carries
  `rel="noopener noreferrer"`.
- **Subresource Integrity** on the pinned SheetJS bundle
  (`sha384-…`, version-locked to `xlsx-0.20.0`).
- **i18n HTML sanitizer** (`sanitizeI18nHtml()`) — allowlist-based tag/attribute
  filter for translated strings injected via `data-i18n-html`; blocks
  `javascript:`/`data:`/`vbscript:` URLs and unknown elements.
- **No `eval`, `new Function`, `document.write`, or `setTimeout(string,…)`** in
  application code.
- **Dependencies kept minimal**: only SheetJS at runtime; Vitest + happy-dom for
  tests. No build-time bundler, no transitive npm supply chain at runtime.

## Supported Versions

Only the latest version (deployed at `cloudmoveanalyzer.com`) is supported.
