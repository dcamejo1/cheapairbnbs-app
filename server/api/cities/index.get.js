import mongoose from "mongoose";
import City from "../../models/City.js";

// Connect to MongoDB (you'll need to set up your connection string)
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

export default defineEventHandler(async (event) => {
  await connectDB();

  try {
    // Get query parameters
    const query = getQuery(event);
    const { country, sortBy = "averagePrice", order = "asc" } = query;

    // Build filter
    const filter = {};
    if (country) {
      filter.country = new RegExp(country, "i"); // Case insensitive search
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = order === "desc" ? -1 : 1;

    // Fetch cities
    const cities = await City.find(filter)
      .sort(sortObject)
      .select("-__v") // Exclude version field
      .lean(); // Return plain objects for better performance

    return {
      success: true,
      data: cities,
      count: cities.length,
    };
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch cities",
    });
  }
});
