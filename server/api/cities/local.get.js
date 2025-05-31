import { LocalDataProcessor } from "../../utils/localDataProcessor.js";
import { dataSources } from "../../data/sources.js";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const forceRefresh = query.refresh === "true";

  console.log(
    `🎯 Processing cities from local CSV files (refresh: ${forceRefresh})`
  );

  try {
    const processor = new LocalDataProcessor();
    const cities = await processor.processAllSources(dataSources, forceRefresh);

    return {
      success: true,
      cities,
      count: cities.length,
      processedFromLocal: true,
      timestamp: new Date().toISOString(),
      message: `Processed ${cities.length} cities from local CSV files`,
    };
  } catch (error) {
    console.error("Local processing failed:", error);

    return {
      success: false,
      message: error.message,
      error: error.message,
      suggestion: error.message.includes("No local CSV files found")
        ? "Please run hard pull first: POST /api/data/hardpull"
        : "Check server logs for details",
    };
  }
});
