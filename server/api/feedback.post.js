import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";

export default defineEventHandler(async (event) => {
  console.log("🔍 Feedback API: Request received");

  try {
    // Only allow POST requests
    console.log("🔍 Feedback API: Checking request method");
    if (getMethod(event) !== "POST") {
      console.log("❌ Feedback API: Invalid method:", getMethod(event));
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    // Get request body
    console.log("🔍 Feedback API: Reading request body");
    const body = await readBody(event);
    console.log("📄 Feedback API: Body received:", body);

    // Basic validation
    console.log("🔍 Feedback API: Validating required fields");
    if (!body.type || !body.description) {
      console.log(
        "❌ Feedback API: Missing required fields - type:",
        body.type,
        "description:",
        body.description
      );
      throw createError({
        statusCode: 400,
        statusMessage: "Type and description are required",
      });
    }

    // Validate type
    console.log("🔍 Feedback API: Validating feedback type");
    if (!["bug", "feature_request"].includes(body.type)) {
      console.log("❌ Feedback API: Invalid feedback type:", body.type);
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid feedback type",
      });
    }

    // Validate description length
    console.log("🔍 Feedback API: Validating description length");
    if (!body.description.trim() || body.description.trim().length > 2000) {
      console.log(
        "❌ Feedback API: Invalid description length:",
        body.description.trim().length
      );
      throw createError({
        statusCode: 400,
        statusMessage: "Description must be between 1 and 2000 characters",
      });
    }

    // Get MongoDB connection string from runtime config
    console.log("🔍 Feedback API: Getting MongoDB configuration");
    const config = useRuntimeConfig();
    const mongoUri = config.mongodbUri || process.env.MONGODB_URI;
    console.log("🔗 Feedback API: MongoDB URI exists:", !!mongoUri);
    console.log(
      "🔗 Feedback API: MongoDB URI (first 20 chars):",
      mongoUri ? mongoUri.substring(0, 20) + "..." : "null"
    );

    if (!mongoUri) {
      console.log("❌ Feedback API: No MongoDB URI found");
      throw createError({
        statusCode: 500,
        statusMessage: "Database configuration missing",
      });
    }

    // Connect to MongoDB
    console.log("🔍 Feedback API: Checking MongoDB connection status");
    console.log(
      "📊 Feedback API: Current mongoose connection state:",
      mongoose.connection.readyState
    );
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    if (mongoose.connection.readyState === 0) {
      console.log("🔌 Feedback API: Connecting to MongoDB...");
      await mongoose.connect(mongoUri);
      console.log("✅ Feedback API: Successfully connected to MongoDB");
    } else {
      console.log("✅ Feedback API: MongoDB already connected");
    }

    // Get additional context
    console.log("🔍 Feedback API: Gathering request context");
    const headers = getHeaders(event);
    const userAgent = headers["user-agent"] || "";
    const referer = headers["referer"] || "";
    console.log(
      "📊 Feedback API: User agent:",
      userAgent ? "Present" : "Missing"
    );
    console.log("📊 Feedback API: Referer:", referer || "Not provided");

    // Get IP address (handle various proxy setups)
    console.log("🔍 Feedback API: Determining client IP");
    const forwarded = headers["x-forwarded-for"];
    const realIp = headers["x-real-ip"];
    const remoteAddress = event.node.req.socket?.remoteAddress;

    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : realIp || remoteAddress || "unknown";

    console.log("🌐 Feedback API: Client IP:", ipAddress);

    // Create feedback document
    console.log("🔍 Feedback API: Creating feedback document");
    const feedbackData = {
      type: body.type,
      description: body.description.trim(),
      userAgent,
      url: referer,
      ipAddress,
    };
    console.log(
      "📄 Feedback API: Feedback data to save:",
      JSON.stringify(feedbackData, null, 2)
    );

    const feedback = new Feedback(feedbackData);
    console.log("✅ Feedback API: Feedback document created");

    // Save to database
    console.log("🔍 Feedback API: Saving to database...");
    const savedFeedback = await feedback.save();
    console.log(
      "✅ Feedback API: Successfully saved feedback with ID:",
      savedFeedback._id
    );

    const response = {
      success: true,
      message: "Feedback submitted successfully",
      id: savedFeedback._id,
    };
    console.log("✅ Feedback API: Returning success response:", response);

    return response;
  } catch (error) {
    console.error("❌ Feedback API: Error occurred:", error);
    console.error("❌ Feedback API: Error name:", error.name);
    console.error("❌ Feedback API: Error message:", error.message);
    console.error("❌ Feedback API: Error stack:", error.stack);

    // Handle validation errors
    if (error.name === "ValidationError") {
      console.log("⚠️ Feedback API: Mongoose validation error");
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid feedback data",
      });
    }

    // Handle duplicate or other database errors
    if (error.code === 11000) {
      console.log("⚠️ Feedback API: Duplicate entry error");
      throw createError({
        statusCode: 409,
        statusMessage: "Duplicate feedback detected",
      });
    }

    // Generic error response
    console.log("⚠️ Feedback API: Generic error, re-throwing");
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to submit feedback",
    });
  }
});
