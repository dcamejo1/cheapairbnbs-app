import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { DataProcessor } from "../server/utils/dataProcessor.js";

// Test with the Albany data we already have
const testAlbanyData = async () => {
  const csvPath = path.join(process.cwd(), "..", "albany_listings.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("Albany CSV file not found at:", csvPath);
    return;
  }

  console.log("🧪 Testing data processor with Albany data...");

  const results = [];
  const processor = new DataProcessor();

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const price = processor.parsePrice(row.price);
        if (price > 0 && row.room_type) {
          results.push({
            price,
            roomType: row.room_type,
          });
        }
      })
      .on("end", () => {
        const dataSource = {
          id: "albany-test",
          cityName: "Albany",
          country: "United States",
          region: "New York",
          url: "test",
          scrapedDate: "2025-05-02",
        };

        const stats = processor.calculateStats(results, dataSource);

        console.log("✅ Albany Test Results:");
        console.log(`   City: ${stats.cityName}, ${stats.country}`);
        console.log(`   Average Price: $${stats.averagePrice}`);
        console.log(`   Total Listings: ${stats.totalListings}`);
        console.log(
          `   Entire Place Avg: $${stats.priceBreakdown.entirePlace}`
        );
        console.log(
          `   Private Room Avg: $${stats.priceBreakdown.privateRoom}`
        );
        console.log(`   Shared Room Avg: $${stats.priceBreakdown.sharedRoom}`);

        resolve(stats);
      })
      .on("error", reject);
  });
};

// Run the test
testAlbanyData()
  .then(() => {
    console.log("🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
