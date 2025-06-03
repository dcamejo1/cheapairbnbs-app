import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bug", "feature_request"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000, // Reasonable limit
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    userAgent: {
      type: String,
    },
    url: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
