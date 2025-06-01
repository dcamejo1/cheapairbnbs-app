## CheapAirbnbs - Find Affordable Destinations Worldwide

CheapAirbnbs is a platform that aggregates Airbnb pricing data to help travelers find the most affordable destinations globally.

### Features

- **Real-time Data**: Fetches data from [Inside Airbnb](https://insideairbnb.com/get-the-data/)
- **Hard Pull System**: Download all CSV files locally for faster processing
- **Smart Caching**: Cache-first approach to minimize requests to source servers
- **Global Coverage**: 50+ destinations across continents
- **Respectful Scraping**: 0.5s delays between requests, cache-first approach
- **Price Breakdown**: Shows average prices by room type (entire place, private room, shared room)
- **Search & Filter**: Find destinations by country, city, or region

### How It Works

**Option 1: Hard Pull (Recommended)**

1. **Hard Pull**: Downloads all CSV files locally via `node scripts/hardPull.js pull`
2. **Local Processing**: Processes data from local CSV files (fast & offline capable)
3. **Cache Updates**: Updates cache from processed local data
4. **Fast Operations**: Subsequent requests use cache as source of truth

**Option 2: Traditional (Original)**

1. **Cache-First Approach**: Checks local JSON cache before making any external requests
2. **Respectful Fetching**: When fresh data is needed, adds 0.5s delays between requests
3. **Data Processing**: Downloads, decompresses, and analyzes CSV data from Inside Airbnb
4. **Smart Updates**: Only fetches data for destinations not in cache

### Data Sources

All data comes from [Inside Airbnb](https://insideairbnb.com/get-the-data/), a mission-driven project providing data about Airbnb's impact on residential communities.

### Technical Implementation

- **Frontend**: Vue 3 + Nuxt 3 with Tailwind CSS
- **Backend**: Nitro server with API routes
- **Caching**: JSON file-based caching system
- **Data Processing**: Real-time CSV parsing with filtering and analysis
- **Hard Pull System**: Local CSV storage for faster processing

### API Endpoints

**Public API (Frontend Access)**

- `GET /api/cities/test` - Get cached city data (read-only, secure)

**Administrative Operations (CLI Only)**

All administrative operations have been moved to CLI scripts for security:

```bash
# Data Management
node scripts/hardPull.js pull          # Download all CSV files locally
node scripts/hardPull.js pullMissing   # Download only missing CSV files
node scripts/hardPull.js status        # Check local file status
node scripts/hardPull.js clear         # Clear local files

# Cache Management
node scripts/cacheManager.js status        # Show cache status
node scripts/cacheManager.js repopulate    # Clear cache and repopulate from local CSVs
node scripts/cacheManager.js updateMissing # Add only missing cities to cache
node scripts/cacheManager.js clear         # Clear cache
node scripts/cacheManager.js refresh       # Refresh cache with current data
```

**Security Note**: All administrative functions and expensive operations are intentionally **not exposed as API endpoints** to prevent unauthorized access and resource abuse in production deployments.

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Setup: Download all CSV files locally (recommended first step)
node scripts/hardPull.js pull

# Check local file status
node scripts/hardPull.js status

# Populate cache from local files
node scripts/cacheManager.js repopulate

# Test the API
curl http://localhost:3000/api/cities/test
```

### Production Deployment Workflow

```bash
# 1. Download data (one-time setup or periodic updates)
node scripts/hardPull.js pull

# 2. Process data into cache
node scripts/cacheManager.js repopulate

# 3. Deploy application (cache and local CSVs included)
# Frontend will use GET /api/cities/test for fast cached data

# 4. For updates (when needed):
node scripts/hardPull.js pullMissing      # Get new destinations
node scripts/cacheManager.js updateMissing # Add them to cache
```

### Hard Pull System

The Hard Pull system is the recommended approach for production use:

```bash
# Download all CSV files locally (one-time setup)
node scripts/hardPull.js pull

# Then use the local endpoint for fast processing
curl http://localhost:3000/api/cities/local
```

See `scripts/README.md` for complete Hard Pull documentation.

### Cache Management

The application uses a smart caching system:

- **Cache File**: `server/data/cities-cache.json`
- **Local CSV Files**: `server/data/csvs/` (when using hard pull)
- **Cache Check**: Automatic on server startup and API requests
- **Respectful Delays**: 0.5s between requests to avoid overwhelming servers
- **Hard Refresh**: Clear cache and fetch all fresh data
- **Partial Updates**: Only fetch missing destinations

This approach ensures fast loading times while being respectful to data sources.
