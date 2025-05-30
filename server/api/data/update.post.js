import mongoose from "mongoose";
import City from "../../models/City.js";
import { DataProcessor } from "../../utils/dataProcessor.js";
import { dataSources } from "../../data/sources.js";

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cheapairbnbs";

async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export default defineEventHandler(async () => {
  await connectDB();

  try {
    console.log("🚀 Starting data update process...");

    const processor = new DataProcessor();
    const results = await processor.processAllSources(dataSources);

    console.log(`📊 Processed ${results.length} cities`);

    // Update or insert cities in database
    const updatePromises = results.map(async (cityData) => {
      return await City.findOneAndUpdate({ id: cityData.id }, cityData, {
        upsert: true,
        new: true,
      });
    });

    const updatedCities = await Promise.all(updatePromises);

    console.log("✅ Data update completed successfully");

    return {
      success: true,
      message: "Data updated successfully",
      processed: results.length,
      cities: updatedCities.map((city) => ({
        id: city.id,
        cityName: city.cityName,
        country: city.country,
        averagePrice: city.averagePrice,
        totalListings: city.totalListings,
      })),
    };
  } catch (error) {
    console.error("❌ Error updating data:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update data: " + error.message,
    });
  }
});
