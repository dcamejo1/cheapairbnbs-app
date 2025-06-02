import mongoose from "mongoose";

// Define the subscription schema
const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active",
  },
  reason: {
    type: String,
    default: "cheapairbnbs",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create or get existing model
const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema, "cheapairbnbsemails");

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 3; // 3 attempts per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userAttempts = rateLimitMap.get(ip) || [];

  // Remove old attempts outside the window
  const recentAttempts = userAttempts.filter(
    (time: number) => now - time < RATE_LIMIT_WINDOW
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  // Add current attempt
  recentAttempts.push(now);
  rateLimitMap.set(ip, recentAttempts);

  return true; // Allowed
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP =
      getHeader(event, "x-forwarded-for") ||
      getHeader(event, "x-real-ip") ||
      "unknown";

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too many requests. Please try again later.",
      });
    }

    const body = await readBody(event);
    const { email } = body;

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email is required",
      });
    }

    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      throw createError({
        statusCode: 400,
        statusMessage: "Please enter a valid email address",
      });
    }

    // Get MongoDB connection string from runtime config
    const config = useRuntimeConfig();
    const mongoUri = config.mongodbUri || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database configuration missing",
      });
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Check if email already exists
    const existingSubscription = await Subscription.findOne({ email });

    if (existingSubscription) {
      if (existingSubscription.status === "active") {
        return {
          success: true,
          message: "You are already subscribed to notifications!",
          alreadySubscribed: true,
        };
      } else {
        // Reactivate inactive subscription
        existingSubscription.status = "active";
        await existingSubscription.save();
        return {
          success: true,
          message: "Your subscription has been reactivated!",
          reactivated: true,
        };
      }
    }

    // Create new subscription
    const subscription = new Subscription({
      email,
      status: "active",
      reason: "cheapairbnbs",
    });

    await subscription.save();

    return {
      success: true,
      message: "Successfully subscribed to notifications!",
      subscription: {
        email: subscription.email,
        status: subscription.status,
        reason: subscription.reason,
        createdAt: subscription.createdAt,
      },
    };
  } catch (error: any) {
    console.error("Subscription error:", error);

    if (error?.code === 11000) {
      // Duplicate key error
      return {
        success: true,
        message: "You are already subscribed to notifications!",
        alreadySubscribed: true,
      };
    }

    if (error?.name === "ValidationError") {
      throw createError({
        statusCode: 400,
        statusMessage: error.message || "Validation error",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to subscribe. Please try again later.",
    });
  }
});
