import { dataSources } from "../server/data/sources.js";
import { CacheManager } from "../server/utils/cacheManager.js";

class CacheStatusChecker {
  constructor() {
    this.cacheManager = new CacheManager();
  }

  async checkCacheStatus() {
    console.log("🔍 Checking cache status...\n");

    // Get all source cities
    const sourceCities = dataSources.map((source) => ({
      id: source.id,
      cityName: source.cityName,
      country: source.country,
      region: source.region,
    }));

    // Get cached cities
    const cachedCities = await this.cacheManager.getCachedCities();
    const cachedIds = new Set(cachedCities.map((city) => city.id));

    // Find missing cities (in sources but not in cache)
    const missingFromCache = sourceCities.filter(
      (source) => !cachedIds.has(source.id)
    );

    // Find orphaned cities (in cache but not in sources)
    const sourceIds = new Set(sourceCities.map((source) => source.id));
    const orphanedInCache = cachedCities.filter(
      (cached) => !sourceIds.has(cached.id)
    );

    // Display results
    this.displayResults({
      totalSources: sourceCities.length,
      totalCached: cachedCities.length,
      missingFromCache,
      orphanedInCache,
      sourceCities,
      cachedCities,
    });

    return {
      missingFromCache,
      orphanedInCache,
      stats: {
        totalSources: sourceCities.length,
        totalCached: cachedCities.length,
        missingCount: missingFromCache.length,
        orphanedCount: orphanedInCache.length,
      },
    };
  }

  displayResults({
    totalSources,
    totalCached,
    missingFromCache,
    orphanedInCache,
  }) {
    // Summary
    console.log("📊 CACHE STATUS SUMMARY");
    console.log("========================");
    console.log(`📋 Total cities in sources: ${totalSources}`);
    console.log(`📦 Total cities in cache: ${totalCached}`);
    console.log(`❌ Missing from cache: ${missingFromCache.length}`);
    console.log(`🔄 Orphaned in cache: ${orphanedInCache.length}`);

    const coveragePercent =
      totalSources > 0
        ? Math.round(
            ((totalCached - orphanedInCache.length) / totalSources) * 100
          )
        : 0;
    console.log(`📈 Cache coverage: ${coveragePercent}%\n`);

    // Missing cities
    if (missingFromCache.length > 0) {
      console.log("❌ CITIES MISSING FROM CACHE:");
      console.log("=============================");
      missingFromCache.forEach((city, index) => {
        console.log(
          `${index + 1}. ${city.cityName}, ${city.country} (${city.id})`
        );
      });
      console.log();
    } else {
      console.log("✅ All source cities are in cache!\n");
    }

    // Orphaned cities
    if (orphanedInCache.length > 0) {
      console.log("🔄 CITIES IN CACHE BUT NOT IN SOURCES:");
      console.log("=====================================");
      orphanedInCache.forEach((city, index) => {
        console.log(
          `${index + 1}. ${city.cityName}, ${city.country} (${city.id})`
        );
      });
      console.log();
    }

    // Recommendations
    console.log("💡 RECOMMENDATIONS:");
    console.log("===================");

    if (missingFromCache.length > 0) {
      console.log("To populate missing cities:");
      console.log(
        "  🎯 Smart:  node scripts/hardPull.js pullMissing  (recommended - only missing)"
      );
      console.log("  🌐 Remote: curl http://localhost:3000/api/cities/test");
      console.log("  📁 Local:  curl http://localhost:3000/api/cities/local");
      console.log(
        "  🔧 Full:   node scripts/hardPull.js pull (downloads all cities)"
      );
    }

    if (orphanedInCache.length > 0) {
      console.log("To clean orphaned cities:");
      console.log(
        "  🗑️  Clear cache: curl -X POST http://localhost:3000/api/data/update"
      );
    }

    if (missingFromCache.length === 0 && orphanedInCache.length === 0) {
      console.log("✅ Cache is in perfect sync with sources!");
    }
  }

  async findSpecificCity(cityQuery) {
    const sourceCities = dataSources.map((source) => ({
      id: source.id,
      cityName: source.cityName,
      country: source.country,
      region: source.region,
    }));

    const cachedCities = await this.cacheManager.getCachedCities();

    const query = cityQuery.toLowerCase();

    // Find in sources
    const foundInSources = sourceCities.filter(
      (city) =>
        city.cityName.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.id.toLowerCase().includes(query)
    );

    // Find in cache
    const foundInCache = cachedCities.filter(
      (city) =>
        city.cityName.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.id.toLowerCase().includes(query)
    );

    console.log(`🔍 Search results for "${cityQuery}":\n`);

    if (foundInSources.length > 0) {
      console.log("📋 Found in sources:");
      foundInSources.forEach((city) => {
        const inCache = foundInCache.some((cached) => cached.id === city.id);
        const status = inCache ? "✅ Cached" : "❌ Not cached";
        console.log(
          `  • ${city.cityName}, ${city.country} (${city.id}) - ${status}`
        );
      });
      console.log();
    }

    if (foundInCache.length > 0) {
      console.log("📦 Found in cache:");
      foundInCache.forEach((city) => {
        const inSources = foundInSources.some(
          (source) => source.id === city.id
        );
        const status = inSources ? "✅ In sources" : "🔄 Orphaned";
        console.log(
          `  • ${city.cityName}, ${city.country} (${city.id}) - ${status}`
        );
        if (city.lastUpdated) {
          console.log(
            `    Last updated: ${new Date(city.lastUpdated).toLocaleString()}`
          );
        }
      });
    }

    if (foundInSources.length === 0 && foundInCache.length === 0) {
      console.log(`No cities found matching "${cityQuery}"`);
    }
  }

  async listAllCities() {
    const sourceCities = dataSources.map((source) => ({
      id: source.id,
      cityName: source.cityName,
      country: source.country,
      region: source.region,
    }));

    const cachedCities = await this.cacheManager.getCachedCities();
    const cachedIds = new Set(cachedCities.map((city) => city.id));

    console.log("📋 ALL CITIES IN SOURCES:");
    console.log("=========================");

    // Group by country
    const byCountry = {};
    sourceCities.forEach((city) => {
      if (!byCountry[city.country]) {
        byCountry[city.country] = [];
      }
      byCountry[city.country].push(city);
    });

    Object.keys(byCountry)
      .sort()
      .forEach((country) => {
        console.log(`\n🌍 ${country}:`);
        byCountry[country].forEach((city) => {
          const status = cachedIds.has(city.id) ? "✅" : "❌";
          console.log(`  ${status} ${city.cityName} (${city.id})`);
        });
      });

    console.log(`\n📊 Total: ${sourceCities.length} cities`);
    console.log(
      `✅ Cached: ${
        sourceCities.filter((city) => cachedIds.has(city.id)).length
      }`
    );
    console.log(
      `❌ Missing: ${
        sourceCities.filter((city) => !cachedIds.has(city.id)).length
      }`
    );
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new CacheStatusChecker();

  const command = process.argv[2];
  const query = process.argv[3];

  try {
    switch (command) {
      case "status":
        await checker.checkCacheStatus();
        break;
      case "find":
        if (!query) {
          console.log("❌ Error: Missing city name");
          console.log("Usage: node scripts/cacheStatus.js find <city_name>");
          console.log("Example: node scripts/cacheStatus.js find london");
          process.exit(1);
        }
        await checker.findSpecificCity(query);
        break;
      case "list":
        await checker.listAllCities();
        break;
      case "help":
      case "--help":
      case "-h":
        console.log(
          "🔍 Cache Status Checker - Check which cities are missing from cache"
        );
        console.log(
          "===================================================================="
        );
        console.log("");
        console.log("Usage:");
        console.log("  node scripts/cacheStatus.js [command] [options]");
        console.log("");
        console.log("Commands:");
        console.log("  status              Show cache status summary");
        console.log(
          "  find <city>         Find specific city in sources/cache"
        );
        console.log(
          "  list                List all cities grouped by country with status"
        );
        console.log("  help                Show this help message");
        console.log("");
        console.log("Examples:");
        console.log(
          "  node scripts/cacheStatus.js status             # Show cache status"
        );
        console.log(
          "  node scripts/cacheStatus.js find london        # Find London"
        );
        console.log(
          '  node scripts/cacheStatus.js find "new york"    # Find New York'
        );
        console.log(
          "  node scripts/cacheStatus.js find germany       # Find German cities"
        );
        console.log(
          "  node scripts/cacheStatus.js list               # List all cities"
        );
        console.log("");
        console.log("Output:");
        console.log("  ✅ = City is cached");
        console.log("  ❌ = City is missing from cache");
        console.log("  🔄 = City is orphaned (in cache but not in sources)");
        break;
      case undefined:
      default:
        console.log("Usage:");
        console.log(
          "  node scripts/cacheStatus.js status             - Show cache status summary"
        );
        console.log(
          "  node scripts/cacheStatus.js find <city>        - Find specific city"
        );
        console.log(
          "  node scripts/cacheStatus.js list               - List all cities with status"
        );
        console.log(
          "  node scripts/cacheStatus.js help               - Show detailed help"
        );
        if (command && command !== undefined) {
          console.log(`\n❌ Unknown command: '${command}'`);
        }
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

export { CacheStatusChecker };
