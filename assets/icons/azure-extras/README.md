# azure-extras — Portal-only SVG icons

This folder holds Azure Portal icons that are **not** in the official
[Azure Architecture Icons pack](https://learn.microsoft.com/azure/architecture/icons/)
(the download under `Downloads/Azure_Public_Service_Icons/`).

A handful of resource types are rendered by the Portal using internal,
package-scoped SVGs (e.g. `Microsoft_Azure_Monitoring_Alerts/ActionGroup.svg`)
that Microsoft does not ship in the public icon pack. Without these the
fuzzy matcher in `scripts/build-icon-map.js` falls back to visually-incorrect
icons (e.g. the generic Activity Log book for `microsoft.insights/activitylogalerts`).

## Source

SVGs are mirrored from the public, auto-extracted Portal metadata at
<https://github.com/maskati/azure-icons> — the same source used by
`scripts/sync-portal-icons.js` to refresh `data/portal-icon-snapshot.json`.

Path on the mirror:
```
svg/<package>/<IconName>.svg
```

The path can be looked up in `data/portal-icon-snapshot.json` under the
matching `resourceType` → `portalSvgPath` entry.

## Adding a new portal-only icon

1. Find the icon in `data/portal-icon-snapshot.json` → note its `portalSvgPath`.
2. Download from
   `https://raw.githubusercontent.com/maskati/azure-icons/main/<portalSvgPath>`.
3. Save here as `<kebab-case-slug>.svg` (lowercase, dashes, no extension prefix).
4. Reference the new slug in `data/icon-map.json`.
5. Run `node scripts/build-icon-map.js` — extras are merged into the SVG index
   automatically and copied to `assets/icons/azure/<slug>.svg` at build time.

## Licensing

These icons are © Microsoft Corporation and follow the same usage terms as
the rest of the icon set documented in `assets/icons/azure/LICENSE.txt`.
