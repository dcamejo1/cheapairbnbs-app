import { CacheManager } from "../../utils/cacheManager.js";

// Cache for processed data in memory
let cachedCities = [];
let lastProcessed = null;

export default defineEventHandler(async () => {
  try {
    const cacheManager = new CacheManager();

    // Always try to load from cache first
    if (cachedCities.length === 0) {
      cachedCities = await cacheManager.getCachedCities();
      if (cachedCities.length > 0) {
        lastProcessed = Date.now();
        console.log(`📦 Loaded ${cachedCities.length} cities from cache`);
      }
    }

    const cacheInfo = await cacheManager.getCacheInfo();

    return {
      success: true,
      data: cachedCities,
      cached: true,
      cacheInfo: {
        exists: cacheInfo.exists,
        citiesCount: cacheInfo.citiesCount,
        lastUpdated: cacheInfo.lastUpdated,
        version: cacheInfo.version,
      },
      lastProcessed: lastProcessed
        ? new Date(lastProcessed).toISOString()
        : null,
      count: cachedCities.length,
    };
  } catch (error) {
    console.error("❌ Error in cities API:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load city data from cache: " + error.message,
    });
  }
});
