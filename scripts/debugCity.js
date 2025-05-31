import { LocalDataProcessor } from "../server/utils/localDataProcessor.js";

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new LocalDataProcessor();

  const cityId = process.argv[2];

  if (!cityId) {
    console.log("Usage:");
    console.log(
      "  node scripts/debugCity.js <city_id>        - Debug price calculations for a specific city"
    );
    console.log("");
    console.log("Examples:");
    console.log(
      "  node scripts/debugCity.js budapest         - Debug Budapest pricing"
    );
    console.log(
      "  node scripts/debugCity.js new-york-city    - Debug NYC pricing"
    );
    console.log(
      "  node scripts/debugCity.js london           - Debug London pricing"
    );
    console.log("");
    console.log("This will show:");
    console.log("  📊 Total records and filtering details");
    console.log("  💰 Price statistics (min, max, median, average)");
    console.log("  🚫 Outliers and invalid prices");
    console.log("  🏠 Room type breakdown");
    console.log("  ✅ Sample valid listings");
    console.log("");
    console.log(
      "Tip: Use 'node scripts/cacheStatus.js list' to see all available city IDs"
    );
    process.exit(0);
  }

  try {
    await processor.debugSingleCity(cityId);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    if (error.message.includes("not found in sources")) {
      console.log("\n💡 Available cities:");
      console.log("   Run: node scripts/cacheStatus.js list");
    } else if (error.message.includes("Local CSV file not found")) {
      console.log("\n💡 To download CSV files:");
      console.log("   Run: node scripts/hardPull.js pull");
    }

    process.exit(1);
  }
}

export { LocalDataProcessor };
