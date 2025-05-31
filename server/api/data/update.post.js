import { DataProcessor } from "../../utils/dataProcessor.js";
import { CacheManager } from "../../utils/cacheManager.js";
import { dataSources } from "../../data/sources.js";

export default defineEventHandler(async (event) => {
  let updateType = "unknown"; // Default value for error handling

  try {
    const body = await readBody(event);
    updateType = body?.type || "hard"; // Default to hard update for backwards compatibility

    console.log(`🔄 ${updateType} update requested`);

    const cacheManager = new CacheManager();
    const processor = new DataProcessor();
    let results;

    if (updateType === "soft") {
      // Soft update: Only fetch cities not in cache
      console.log("📦 Performing soft update - fetching missing cities only");
      results = await processor.processAllSources(dataSources, false);

      console.log(
        `✅ Soft update completed: ${results.length} total cities (new ones added)`
      );
    } else {
      // Hard update: Clear cache and fetch all fresh data
      console.log(
        "🔄 Performing hard update - clearing cache and fetching all fresh data"
      );

      // Clear existing cache
      await cacheManager.clearCache();

      // Force fresh data processing for all cities
      results = await processor.processAllSources(dataSources, true);

      console.log(`✅ Hard update completed: ${results.length} cities updated`);
    }

    return {
      success: true,
      message: `${updateType} update completed successfully`,
      updateType,
      citiesUpdated: results.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ Error during ${updateType || "unknown"} update:`, error);

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to perform update: ${error.message}`,
    });
  }
});
