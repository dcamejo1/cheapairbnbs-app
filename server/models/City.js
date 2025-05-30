import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    cityName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    averagePrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    totalListings: {
      type: Number,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    dataSource: {
      url: String,
      scrapedDate: String,
    },
    priceBreakdown: {
      entirePlace: Number,
      privateRoom: Number,
      sharedRoom: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
citySchema.index({ country: 1, averagePrice: 1 });
citySchema.index({ averagePrice: 1 });

export default mongoose.model("City", citySchema);
