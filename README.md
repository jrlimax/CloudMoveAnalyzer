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
| **Smart column detection** | Automatically detects Type, Name, Resource Group, Location, and Resource ID columns |
| **Smart notes** | Migration dependencies, constraints, and direct links to official docs |
| **Search & filter** | Find specific resources or filter by move status |
| **CSV export** | Download results with translated headers for documentation or planning |
| **Template download** | Download a pre-formatted spreadsheet template to get started |
| **Deduplication** | Automatically removes duplicate resources from your spreadsheet |
| **9 FAQs** | SEO-optimized FAQ section with step-by-step guides |
| **8 languages** | 🇺🇸 🇧🇷 🇨🇳 🇪🇸 🇫🇷 🇸🇦 🇷🇺 🇯🇵 |
| **Dark & Light mode** | Light theme by default, with dark mode toggle |
| **100% private** | All processing happens in your browser — zero data leaves your machine |

---

## How It Works

1. Go to [**cloudmoveanalyzer.com**](https://cloudmoveanalyzer.com/)
2. Export your resources from the [Azure Portal → All Resources → Export to CSV](https://portal.azure.com/#browse/all)
3. Upload the file — the tool checks each resource type against [Microsoft's official documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-support-resources)
4. Review the report: filter, search, sort by clicking column headers, and export as CSV

> **No signup. No login. No data sent anywhere.**

---

## Data Source

Move support data is sourced from Microsoft's official [resource-capabilities](https://github.com/tfitzmac/resource-capabilities) repository and is refreshed automatically on each page load to ensure you always have the latest information.

---

## Tech Stack

- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks)
- **Spreadsheet parsing:** [SheetJS (XLSX)](https://sheetjs.com/) via CDN
- **Hosting:** [Azure Static Web Apps](https://azure.microsoft.com/en-us/products/app-service/static)
- **CI/CD:** GitHub Actions → Azure Static Web Apps deploy on push to `main`

---

## Project Structure

```
├── index.html            # Entry point (SEO meta, structured data, FAQ)
├── css/
│   └── style.css         # Styles (dark/light themes, responsive)
├── js/
│   ├── app.js            # Application logic (upload, analysis, export)
│   ├── i18n.js           # Internationalization (8 languages, 9 FAQs)
│   └── move-database.js  # Azure move support database
├── assets/
│   ├── logo.png          # Site logo
│   └── pix-qr.png        # Donation QR code
├── .github/
│   └── workflows/        # Azure Static Web Apps CI/CD
├── robots.txt
└── sitemap.xml
```

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## Support

If Cloud Move Analyzer saved you time, consider buying me a coffee ☕

<p align="center">
  <a href="https://ko-fi.com/jrlimax"><strong>☕ Buy me a coffee on Ko-fi</strong></a>
</p>

### 🇧🇷 PIX (Brasil)

<p align="center">
  <img src="assets/pix-qr.png" alt="PIX QR Code" width="180" />
  <br>
  <code>9f7802e4-3dcb-47fa-8e70-7119cb5b4761</code>
</p>
