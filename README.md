# ☁️ Cloud Move Analyzer

**Planning an Azure migration?** Check which resources can be moved between subscriptions, resource groups, and regions — instantly and for free.

<p align="center">
  <a href="https://cloudmoveanalyzer.com/"><strong>👉 Open Cloud Move Analyzer</strong></a>
</p>

---

## Why Use It?

Moving Azure resources isn't always straightforward. Not every resource type supports every move operation, and finding that out mid-migration can cost hours.

**Cloud Move Analyzer** lets you upload a spreadsheet exported from the Azure Portal and instantly see a clear, filterable report of what can — and can't — be moved.

### ✅ Key Features

| Feature | Description |
|---------|-------------|
| **Instant analysis** | Upload `.csv`, `.xlsx`, or `.xls` and get results in seconds |
| **3 move checks** | Resource Group, Subscription, and Region move support |
| **Smart notes** | Migration dependencies and constraints for each resource |
| **Search & filter** | Find specific resources or filter by move status |
| **CSV export** | Download filtered results for documentation or planning |
| **8 languages** | 🇺🇸 🇧🇷 🇨🇳 🇪🇸 🇫🇷 🇸🇦 🇷🇺 🇯🇵 |
| **Dark & Light mode** | Easy on the eyes, any time of day |
| **100% private** | All processing happens in your browser — zero data leaves your machine |

---

## How It Works

1. Go to [**cloudmoveanalyzer.com**](https://cloudmoveanalyzer.com/)
2. Export your resources from the [Azure Portal](https://portal.azure.com/) as a spreadsheet
3. Upload the file — the tool checks each resource type against [Microsoft's official documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-support-resources)
4. Review the report: filter, search, and export as needed

> **No signup. No login. No data sent anywhere.**

---

## Data Source

Move support data is sourced from Microsoft's official [resource-capabilities](https://github.com/tfitzmac/resource-capabilities) repository and is refreshed automatically on each page load to ensure you always have the latest information.

---

## Project Structure

```
├── index.html            # Entry point
├── css/
│   └── style.css         # Styles (dark/light themes, responsive)
├── js/
│   ├── app.js            # Application logic
│   ├── i18n.js           # Internationalization (8 languages)
│   └── move-database.js  # Azure move support database
├── assets/
│   ├── logo.png
│   └── pix-qr.png
├── robots.txt
└── sitemap.xml
```
