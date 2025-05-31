# Scripts Documentation

This directory contains CLI scripts for managing the CheapAirbnbs data pipeline, including CSV downloads, cache management, and debugging tools.

## Overview

The system uses a two-tier approach:

1. **Hard Pull**: Download CSV files locally from Inside Airbnb
2. **Cache Management**: Process local CSVs with currency conversion and maintain cache

## Quick Start

### Complete Setup Workflow

```bash
# 1. Download all CSV files locally (one-time setup)
node scripts/hardPull.js pull

# 2. Process CSVs and populate cache with USD conversion
node scripts/cacheManager.js repopulate

# 3. Check status
node scripts/cacheStatus.js status
```

### Regular Maintenance

```bash
# Download only missing CSV files (efficient)
node scripts/hardPull.js pullMissing

# Process only missing cities into cache (NEW - incremental update)
node scripts/cacheManager.js updateMissing

# OR refresh entire cache (slower but comprehensive)
node scripts/cacheManager.js repopulate
```

### Adding New Cities Efficiently

```bash
# 1. Add new city to sources.js
# 2. Download only the new CSV file
node scripts/hardPull.js pullMissing

# 3. Process only the new city into cache (fast!)
node scripts/cacheManager.js updateMissing
```

---

## Hard Pull System

Downloads CSV files from Inside Airbnb locally for faster, offline processing.

### Commands

```bash
# Download all CSV files (65 cities)
node scripts/hardPull.js pull

# Download only missing CSV files (recommended)
node scripts/hardPull.js pullMissing

# Check status of local files
node scripts/hardPull.js status

# Clear all local files
node scripts/hardPull.js clear
```

### API Endpoints

```bash
# Trigger hard pull via API
curl -X POST http://localhost:3000/api/data/hardpull

# Download only missing CSVs
curl -X POST http://localhost:3000/api/data/pullMissing

# Check local file status
curl http://localhost:3000/api/data/status
```

---

## Cache Management

Manages the city pricing cache with automatic currency conversion to USD.

### Commands

```bash
# Clear cache
node scripts/cacheManager.js clear

# Clear cache and repopulate from local CSVs (recommended)
node scripts/cacheManager.js repopulate

# Add only missing cities to cache (incremental - NEW)
node scripts/cacheManager.js updateMissing

# Refresh cache without clearing
node scripts/cacheManager.js refresh

# Show cache status
node scripts/cacheManager.js status
```

### Currency Conversion

The system automatically converts all prices to USD using exchange rates defined in `server/data/currencies.js`:

- **Budapest (HUF)**: 25,000 HUF → $65 USD
- **Prague (CZK)**: 2,000 CZK → $86 USD
- **Stockholm (SEK)**: 1,500 SEK → $142 USD
- **London (GBP)**: 120 GBP → $152 USD
- **Paris (EUR)**: 150 EUR → $164 USD

### Supported Currencies

| Currency         | Code | Example Cities                    |
| ---------------- | ---- | --------------------------------- |
| US Dollar        | USD  | New York, San Francisco, Miami    |
| Euro             | EUR  | Paris, Berlin, Rome, Amsterdam    |
| British Pound    | GBP  | London, Edinburgh, Manchester     |
| Hungarian Forint | HUF  | Budapest                          |
| Czech Koruna     | CZK  | Prague                            |
| Swedish Krona    | SEK  | Stockholm                         |
| Canadian Dollar  | CAD  | Toronto, Vancouver, Montreal      |
| Japanese Yen     | JPY  | Tokyo                             |
| And 15+ more...  |      | See `currencies.js` for full list |

---

## Cache Status Checking

Monitor which cities are cached and identify missing data.

### Commands

```bash
# Show cache status summary
node scripts/cacheStatus.js status

# Find specific city
node scripts/cacheStatus.js find london
node scripts/cacheStatus.js find "new york"

# List all cities with cache status
node scripts/cacheStatus.js list

# Show help
node scripts/cacheStatus.js help
```

### Output Example

```
📊 CACHE STATUS SUMMARY
========================
📋 Total cities in sources: 65
📦 Total cities in cache: 30
❌ Missing from cache: 35
📈 Cache coverage: 46%

💡 RECOMMENDATIONS:
===================
🎯 Smart: node scripts/hardPull.js pullMissing (recommended)
```

---

## City Debugging

Debug pricing calculations for specific cities to identify currency or data issues.

### Commands

```bash
# Debug specific city pricing
node scripts/debugCity.js budapest
node scripts/debugCity.js "new-york-city"
node scripts/debugCity.js tokyo

# Show available cities
node scripts/cacheStatus.js list
```

### Debug Output Example

```
🔍 Debugging city: budapest
💱 Currency: HUF
🔄 Will convert to USD for final results
🚫 Outlier threshold: HUF 384,615 (~$1000 USD)

📈 PRICE STATISTICS (Local HUF):
   💰 Average: HUF 31,062.78
   📈 Max: HUF 381,494.00

📈 PRICE STATISTICS (Converted to USD):
   💰 Average: $80.76
   📈 Max: $991.88
```

---

## File Structure

```
server/data/
├── csvs/                        # Local CSV files
│   ├── budapest.csv             # Raw CSV data
│   ├── budapest_metadata.json   # Download metadata
│   └── download_summary.json    # Pull operation summary
├── sources.js                   # City definitions with currencies
├── currencies.js                # Exchange rates and conversion logic
└── cities-cache.json           # Processed city data cache
```

---

## API Integration

### Local Processing (Recommended)

```bash
# Process from local CSVs with currency conversion
curl http://localhost:3000/api/cities/local

# Force refresh from local files
curl http://localhost:3000/api/cities/local?refresh=true
```

### Traditional Remote Processing

```bash
# Fetch fresh data from Inside Airbnb (slower)
curl http://localhost:3000/api/cities/test?refresh=true

# Hard refresh: clear cache + fetch all fresh data
curl -X POST http://localhost:3000/api/data/update
```

---

## Workflows

### 🚀 New Project Setup

```bash
# 1. Download all CSV files
node scripts/hardPull.js pull

# 2. Populate cache with USD conversion
node scripts/cacheManager.js repopulate

# 3. Verify setup
node scripts/cacheStatus.js status
```

### 🔄 Regular Updates

```bash
# 1. Download missing CSVs only (efficient)
node scripts/hardPull.js pullMissing

# 2. Process only missing cities (NEW - much faster!)
node scripts/cacheManager.js updateMissing
```

### ➕ Adding New Cities Workflow

```bash
# 1. Add new city to server/data/sources.js
# 2. Download only the new CSV
node scripts/hardPull.js pullMissing

# 3. Process only the new city (incremental update)
node scripts/cacheManager.js updateMissing

# 4. Verify the addition
node scripts/cacheStatus.js status
```

### 🐛 Debugging Pricing Issues

```bash
# 1. Check cache status
node scripts/cacheStatus.js status

# 2. Debug specific city
node scripts/debugCity.js budapest

# 3. Check currency conversion
# Look for outliers, invalid data, currency issues
```

### 💱 Currency Conversion Fix (Budapest $8213 → $80)

```bash
# The system now automatically:
# 1. Detects currency from sources.js
# 2. Uses USD-equivalent outlier thresholds
# 3. Converts all prices to USD for display
# 4. Maintains local currency for debugging
```

---

## Benefits

- **🚀 Performance**: Local CSV processing (50ms vs 500ms per city)
- **💰 Accurate Pricing**: Automatic currency conversion to USD
- **🌐 Offline Capable**: Works without internet after initial download
- **🎯 Efficient Updates**: Only download missing/changed data
- **🔍 Debugging Tools**: Deep insights into pricing calculations
- **📊 Consistent Display**: All prices shown in USD regardless of source currency
- **⚡ Incremental Updates**: Add new cities without reprocessing everything

---

## Troubleshooting

### "Local CSV file not found"

```bash
# Download missing files
node scripts/hardPull.js pullMissing
```

### "Absurdly high prices" (e.g., Budapest $8213)

```bash
# Debug the city to check currency conversion
node scripts/debugCity.js budapest

# Repopulate cache with new conversion logic
node scripts/cacheManager.js repopulate
```

### "Cache out of sync"

```bash
# Check status first
node scripts/cacheStatus.js status

# For incremental fix (faster)
node scripts/cacheManager.js updateMissing

# For full refresh (comprehensive)
node scripts/cacheManager.js repopulate
```

### "Missing cities in frontend"

```bash
# Check what's missing
node scripts/cacheStatus.js status

# Download missing CSVs
node scripts/hardPull.js pullMissing

# Process only missing cities (NEW - faster)
node scripts/cacheManager.js updateMissing

# OR refresh entire cache (slower)
node scripts/cacheManager.js repopulate
```
