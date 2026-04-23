# Cloud Move Analyzer

Free tool to check Azure resource move support — verify which resources can be migrated between subscriptions, resource groups, and regions.

Upload your Azure export spreadsheet and get instant results.

🔗 **Live:** [cloudmoveanalyzer.com](https://cloudmoveanalyzer.com/)

## Features

- Upload `.csv`, `.xlsx`, or `.xls` spreadsheets exported from the Azure Portal
- Instantly check move support for each resource type (Resource Group, Subscription, Region)
- Filter and search results by resource name, type, or status
- Export results as CSV
- Multi-language support: English, Português, 中文, Español, Français, العربية, Русский, 日本語
- Light/Dark theme
- 100% client-side — your data never leaves your browser

## Project Structure

```
CloudMoveAnalyzer/
├── index.html          # Main HTML entry point
├── robots.txt          # Search engine crawling rules
├── sitemap.xml         # Sitemap for SEO
├── css/
│   └── style.css       # Application styles (light/dark themes, responsive)
├── js/
│   ├── app.js          # Main application logic (upload, analysis, rendering)
│   ├── i18n.js         # Internationalization (8 languages)
│   └── move-database.js # Azure resource move support database
```

## How It Works

1. Export your resources from the [Azure Portal](https://portal.azure.com/) as a spreadsheet
2. Upload the file to Cloud Move Analyzer
3. The tool checks each resource type against [Microsoft's official move support documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-support-resources)
4. View a clear report showing which resources can be moved

## Data Source

Resource move support data is based on the [official Microsoft documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-support-resources) and is automatically updated from the [resource-capabilities](https://github.com/tfitzmac/resource-capabilities) repository.

## License

This project is open source and free to use.
