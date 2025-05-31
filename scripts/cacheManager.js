import { CacheManager } from "../server/utils/cacheManager.js";
import { LocalDataProcessor } from "../server/utils/localDataProcessor.js";
import { dataSources } from "../server/data/sources.js";

class CacheManagerCLI {
  constructor() {
    this.cacheManager = new CacheManager();
    this.localProcessor = new LocalDataProcessor();
  }

  async clearCache() {
    console.log("🗑️  Clearing cache...");
    await this.cacheManager.clearCache();
    console.log("✅ Cache cleared successfully");
  }

  async repopulateFromLocal() {
    console.log("🔄 Repopulating cache from local CSV files...");
    console.log("💱 Using new currency conversion logic");

    try {
      const cities = await this.localProcessor.processAllSources(
        dataSources,
        true
      ); // force refresh
      console.log(`✅ Successfully processed ${cities.length} cities`);
      console.log("💰 All prices converted to USD");

      // Show a few examples
      const examples = cities.slice(0, 3);
      console.log("\n📊 Sample results:");
      examples.forEach((city) => {
        console.log(
          `   ${city.cityName}: $${city.averagePrice} USD (${city.currency} converted)`
        );
      });

      return cities;
    } catch (error) {
      console.error("❌ Error repopulating cache:", error.message);
      throw error;
    }
  }

  async showCacheStatus() {
    const cities = await this.cacheManager.getCachedCities();
    console.log(`📦 Cache contains ${cities.length} cities`);

    if (cities.length > 0) {
      const lastUpdated = cities[0]?.lastUpdated;
      if (lastUpdated) {
        console.log(
          `🕒 Last updated: ${new Date(lastUpdated).toLocaleString()}`
        );
      }

      // Check if currencies are included (new format)
      const withCurrency = cities.filter((city) => city.currency);
      console.log(
        `💱 Cities with currency info: ${withCurrency.length}/${cities.length}`
      );

      if (withCurrency.length < cities.length) {
        console.log(
          "⚠️  Some cities missing currency info - recommend repopulating cache"
        );
      }
    }
  }

  async updateMissing() {
    console.log("🔄 Updating cache with missing cities only...");
    console.log("💱 Using currency conversion logic");

    try {
      // Get current cache
      const cachedCities = await this.cacheManager.getCachedCities();
      const cachedIds = new Set(cachedCities.map((city) => city.id));

      // Find missing cities
      const missingSources = dataSources.filter(
        (source) => !cachedIds.has(source.id)
      );

      if (missingSources.length === 0) {
        console.log("✅ All cities are already in cache - nothing to update");
        return cachedCities;
      }

      console.log(
        `📊 Found ${missingSources.length} missing cities to process:`
      );
      missingSources.forEach((source) => {
        console.log(`   📍 ${source.cityName} (${source.id})`);
      });

      // Process only missing cities
      const newCities = [];
      for (const source of missingSources) {
        try {
          console.log(`🔄 Processing ${source.cityName}...`);
          const cityData =
            await this.localProcessor.processSingleSourceFromLocal(source);
          newCities.push(cityData);
          console.log(
            `   ✅ ${source.cityName}: $${cityData.averagePrice} USD`
          );
        } catch (error) {
          console.log(`   ❌ ${source.cityName}: ${error.message}`);
        }
      }

      // Combine with existing cache
      const allCities = [...cachedCities, ...newCities];

      // Update cache with combined data
      await this.cacheManager.writeCache(allCities);

      console.log(
        `✅ Successfully added ${newCities.length} new cities to cache`
      );
      console.log(`📦 Total cities in cache: ${allCities.length}`);

      if (newCities.length > 0) {
        console.log("\n📊 Newly added cities:");
        newCities.forEach((city) => {
          console.log(
            `   ${city.cityName}: $${city.averagePrice} USD (${city.currency} converted)`
          );
        });
      }

      return allCities;
    } catch (error) {
      console.error("❌ Error updating missing cities:", error.message);
      throw error;
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CacheManagerCLI();
  const command = process.argv[2];

  try {
    switch (command) {
      case "clear":
        await cli.clearCache();
        break;
      case "repopulate":
        await cli.clearCache();
        await cli.repopulateFromLocal();
        break;
      case "updateMissing":
        await cli.updateMissing();
        break;
      case "status":
        await cli.showCacheStatus();
        break;
      case "refresh":
        console.log("🔄 Refreshing cache with new currency conversion...");
        await cli.repopulateFromLocal();
        break;
      default:
        console.log("Usage:");
        console.log(
          "  node scripts/cacheManager.js clear          - Clear cache"
        );
        console.log(
          "  node scripts/cacheManager.js repopulate     - Clear cache and repopulate from local CSVs"
        );
        console.log(
          "  node scripts/cacheManager.js updateMissing  - Add only missing cities to cache (incremental)"
        );
        console.log(
          "  node scripts/cacheManager.js refresh        - Refresh cache with current data"
        );
        console.log(
          "  node scripts/cacheManager.js status         - Show cache status"
        );
        console.log("");
        console.log("For adding new cities efficiently:");
        console.log(
          "  node scripts/hardPull.js pullMissing        # Download new CSVs"
        );
        console.log(
          "  node scripts/cacheManager.js updateMissing  # Process only new CSVs"
        );
        console.log("");
        console.log("For currency conversion fix:");
        console.log(
          "  node scripts/cacheManager.js repopulate     # Recommended"
        );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

export { CacheManagerCLI };
