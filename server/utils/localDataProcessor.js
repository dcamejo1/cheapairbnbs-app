import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import { CacheManager } from "./cacheManager.js";
import { HardPuller } from "./hardPuller.js";
import { convertToUSD, CURRENCIES } from "../data/currencies.js";

export class LocalDataProcessor {
  constructor() {
    this.cacheManager = new CacheManager();
    this.hardPuller = new HardPuller();
    this.csvDir = path.join(process.cwd(), "server", "data", "csvs");
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processAllSources(sources, forceRefresh = false) {
    console.log(
      `🎯 Processing ${sources.length} sources using local CSV files`
    );

    // Check if we should force refresh (meaning delete the cache)
    if (forceRefresh) {
      console.log("🔄 Force refresh requested, clearing cache");
      await this.cacheManager.clearCache();
    } else {
      // Check cache first unless force refresh
      const cachedCities = await this.cacheManager.getCachedCities();
      if (cachedCities.length > 0 && !forceRefresh) {
        console.log(`📦 Found ${cachedCities.length} cached cities`);
        return cachedCities;
      }
    }

    // Check if local CSV files exist
    const localFiles = await this.hardPuller.getLocalFiles();
    console.log(`📁 Found ${localFiles.totalCSVs} local CSV files`);

    if (localFiles.totalCSVs === 0) {
      throw new Error(
        "No local CSV files found. Please run 'node scripts/hardPull.js pull' first to download the data."
      );
    }

    // Process sources that need fresh data
    const results = [];
    const sourcesToProcess = forceRefresh
      ? sources
      : await this.getSourcesNeedingUpdate(sources);

    console.log(
      `⚡ Need to process ${sourcesToProcess.length} cities from local CSV files`
    );

    // Get existing cached data to merge with new results
    let allCities = forceRefresh
      ? []
      : await this.cacheManager.getCachedCities();
    const existingIds = new Set(allCities.map((city) => city.id));

    for (const [index, source] of sourcesToProcess.entries()) {
      try {
        console.log(
          `Processing ${source.cityName} (${index + 1}/${
            sourcesToProcess.length
          })...`
        );

        const cityData = await this.processSingleSourceFromLocal(source);
        if (cityData) {
          results.push(cityData);

          // Update the all cities array
          if (existingIds.has(cityData.id)) {
            // Replace existing city data
            const existingIndex = allCities.findIndex(
              (city) => city.id === cityData.id
            );
            allCities[existingIndex] = cityData;
          } else {
            // Add new city data
            allCities.push(cityData);
          }

          // Save cache immediately after each successful processing
          await this.cacheManager.writeCache(allCities);

          console.log(
            `✅ Processed ${source.cityName}: ${cityData.totalListings} listings, avg: $${cityData.averagePrice}`
          );
        }

        // Add small delay for visual feedback (much smaller since we're reading locally)
        if (index < sourcesToProcess.length - 1) {
          await this.delay(50);
        }
      } catch (error) {
        console.error(
          `❌ Failed to process ${source.cityName}: ${error.message}`
        );
        console.error(
          `   Skipping ${source.cityName} due to error: ${error.message}`
        );
      }
    }

    console.log(`📊 Processed ${results.length} cities from local files`);
    return allCities;
  }

  async getSourcesNeedingUpdate(sources) {
    // For now, return sources that aren't in cache
    // Later we could add logic for staleness checks
    const cachedCities = await this.cacheManager.getCachedCities();
    const cachedIds = new Set(cachedCities.map((city) => city.id));

    return sources.filter((source) => !cachedIds.has(source.id));
  }

  async processSingleSourceFromLocal(source) {
    try {
      // Check cache first
      const cached = await this.cacheManager.getCachedCity(source.id);
      if (cached) {
        console.log(`📦 Using cached data for ${source.cityName}`);
        return cached;
      }

      // Read from local CSV file
      const csvPath = path.join(this.csvDir, `${source.id}.csv`);
      const metadataPath = path.join(this.csvDir, `${source.id}_metadata.json`);

      // Check if local file exists
      try {
        await fs.access(csvPath);
      } catch {
        throw new Error(
          `Local CSV file not found: ${csvPath}. Please run hard pull first.`
        );
      }

      // Read the CSV file
      const csvText = await fs.readFile(csvPath, "utf-8");
      console.log(
        `📄 Reading local CSV for ${source.cityName} (${Math.round(
          csvText.length / 1024
        )} KB)`
      );

      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Read metadata if available
      let metadata = null;
      try {
        const metadataText = await fs.readFile(metadataPath, "utf-8");
        metadata = JSON.parse(metadataText);
      } catch {
        console.log(`⚠️  No metadata found for ${source.cityName}`);
      }

      const result = this.calculateAveragePrice(source, records);

      // Add metadata info if available
      if (metadata) {
        result.localFileInfo = {
          downloadedAt: metadata.downloadedAt,
          fileSize: metadata.fileSize,
          filename: metadata.filename,
        };
      }

      return result;
    } catch (error) {
      console.error(`Error processing ${source.cityName}:`, error.message);
      throw error;
    }
  }

  calculateAveragePrice(source, records) {
    const currency = source.currency || "USD";

    // Set outlier threshold in USD equivalent (e.g., $1000 USD)
    const maxPriceUSD = 1000;
    const maxPriceLocal =
      currency === "USD"
        ? maxPriceUSD
        : maxPriceUSD / (CURRENCIES[currency] || 1);

    const validListings = records.filter((record) => {
      const price = parseFloat(record.price?.replace(/[$,]/g, ""));
      return !isNaN(price) && price > 0 && price < maxPriceLocal;
    });

    if (validListings.length === 0) {
      throw new Error(`No valid listings found for ${source.cityName}`);
    }

    // Calculate overall average in local currency first
    const localPrices = validListings.map((record) =>
      parseFloat(record.price.replace(/[$,]/g, ""))
    );
    const localAveragePrice =
      Math.round(
        (localPrices.reduce((sum, price) => sum + price, 0) /
          localPrices.length) *
          100
      ) / 100;

    // Convert to USD if needed
    const averagePrice =
      currency === "USD"
        ? localAveragePrice
        : convertToUSD(localAveragePrice, currency);

    // Calculate breakdown by room type (also converting to USD)
    const priceBreakdown = this.calculatePriceBreakdown(
      validListings,
      currency
    );

    return {
      id: source.id,
      cityName: source.cityName,
      country: source.country,
      region: source.region,
      currency: currency,
      localAveragePrice: localAveragePrice, // Keep original for debugging
      averagePrice: Math.round(averagePrice * 100) / 100, // USD converted
      totalListings: validListings.length,
      priceBreakdown,
      lastUpdated: new Date().toISOString(),
      scrapedDate: source.scrapedDate,
      sourceUrl: source.url,
      processedFromLocal: true,
    };
  }

  calculatePriceBreakdown(listings, currency = "USD") {
    const breakdown = {
      entirePlace: 0,
      privateRoom: 0,
      sharedRoom: 0,
    };

    const counts = {
      entirePlace: 0,
      privateRoom: 0,
      sharedRoom: 0,
    };

    listings.forEach((listing) => {
      const price = parseFloat(listing.price.replace(/[$,]/g, ""));
      const roomType = listing.room_type?.toLowerCase() || "";

      if (roomType.includes("entire")) {
        breakdown.entirePlace += price;
        counts.entirePlace++;
      } else if (roomType.includes("private")) {
        breakdown.privateRoom += price;
        counts.privateRoom++;
      } else if (roomType.includes("shared")) {
        breakdown.sharedRoom += price;
        counts.sharedRoom++;
      }
    });

    // Calculate averages and convert to USD
    const result = {
      entirePlace:
        counts.entirePlace > 0
          ? Math.round((breakdown.entirePlace / counts.entirePlace) * 100) / 100
          : 0,
      privateRoom:
        counts.privateRoom > 0
          ? Math.round((breakdown.privateRoom / counts.privateRoom) * 100) / 100
          : 0,
      sharedRoom:
        counts.sharedRoom > 0
          ? Math.round((breakdown.sharedRoom / counts.sharedRoom) * 100) / 100
          : 0,
    };

    // Convert to USD if needed
    if (currency !== "USD") {
      result.entirePlace =
        result.entirePlace > 0
          ? Math.round(convertToUSD(result.entirePlace, currency) * 100) / 100
          : 0;
      result.privateRoom =
        result.privateRoom > 0
          ? Math.round(convertToUSD(result.privateRoom, currency) * 100) / 100
          : 0;
      result.sharedRoom =
        result.sharedRoom > 0
          ? Math.round(convertToUSD(result.sharedRoom, currency) * 100) / 100
          : 0;
    }

    return result;
  }

  // Utility method to check local CSV status
  async getLocalDataStatus() {
    return await this.hardPuller.getLocalFiles();
  }

  // Utility method to trigger hard pull
  async triggerHardPull() {
    return await this.hardPuller.pullAllCSVs();
  }

  // Debug method to show detailed calculations for a single city
  async debugSingleCity(cityId) {
    console.log(`🔍 Debugging city: ${cityId}`);
    console.log("=".repeat(50));

    // Find the source
    const { dataSources } = await import("../data/sources.js");
    const source = dataSources.find((s) => s.id === cityId);

    if (!source) {
      throw new Error(`City "${cityId}" not found in sources`);
    }

    console.log(`📍 City: ${source.cityName}, ${source.country}`);
    console.log(`🌐 Source URL: ${source.url}`);
    console.log(`📅 Scraped: ${source.scrapedDate}\n`);

    // Read from local CSV file
    const csvPath = path.join(this.csvDir, `${source.id}.csv`);

    // Check if local file exists
    try {
      await fs.access(csvPath);
    } catch {
      throw new Error(
        `Local CSV file not found: ${csvPath}. Please run 'node scripts/hardPull.js pull' first.`
      );
    }

    // Read the CSV file
    const csvText = await fs.readFile(csvPath, "utf-8");
    console.log(`📄 CSV file size: ${Math.round(csvText.length / 1024)} KB`);

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Total records in CSV: ${records.length}`);

    // Detailed price analysis
    return this.debugPriceCalculation(source, records);
  }

  debugPriceCalculation(source, records) {
    console.log("\n💰 PRICE ANALYSIS:");
    console.log("=".repeat(30));

    const currency = source.currency || "USD";
    console.log(`💱 Currency: ${currency}`);
    if (currency !== "USD") {
      console.log(`🔄 Will convert to USD for final results`);
    }

    // Set outlier threshold in USD equivalent (e.g., $1000 USD)
    const maxPriceUSD = 1000;
    const maxPriceLocal =
      currency === "USD"
        ? maxPriceUSD
        : maxPriceUSD / (CURRENCIES[currency] || 1);
    console.log(
      `🚫 Outlier threshold: ${currency} ${maxPriceLocal.toLocaleString()} (~$${maxPriceUSD} USD)`
    );

    // Analyze all price entries
    const priceAnalysis = {
      total: records.length,
      withPrice: 0,
      validPrice: 0,
      invalidPrice: 0,
      outliers: 0,
      final: 0,
    };

    const allPrices = [];
    const invalidPrices = [];
    const outliers = [];
    const validPrices = [];

    records.forEach((record, index) => {
      const rawPrice = record.price;

      if (!rawPrice) {
        priceAnalysis.invalidPrice++;
        invalidPrices.push({ index, reason: "No price field", record });
        return;
      }

      priceAnalysis.withPrice++;

      // Try to parse price
      const cleanedPrice = rawPrice.replace(/[$,]/g, "");
      const numericPrice = parseFloat(cleanedPrice);

      if (isNaN(numericPrice)) {
        priceAnalysis.invalidPrice++;
        invalidPrices.push({ index, reason: "Not a number", rawPrice, record });
        return;
      }

      if (numericPrice <= 0) {
        priceAnalysis.invalidPrice++;
        invalidPrices.push({
          index,
          reason: "Zero or negative",
          price: numericPrice,
          record,
        });
        return;
      }

      if (numericPrice >= maxPriceLocal) {
        priceAnalysis.outliers++;
        outliers.push({ index, price: numericPrice, rawPrice, record });
        return;
      }

      // Valid price
      priceAnalysis.validPrice++;
      priceAnalysis.final++;
      allPrices.push(numericPrice);
      validPrices.push({ index, price: numericPrice, rawPrice, record });
    });

    // Display analysis
    console.log(
      `📋 Records with price field: ${priceAnalysis.withPrice}/${priceAnalysis.total}`
    );
    console.log(
      `✅ Valid prices (>0, <${maxPriceLocal.toLocaleString()} ${currency}): ${
        priceAnalysis.validPrice
      }`
    );
    console.log(`❌ Invalid prices: ${priceAnalysis.invalidPrice}`);
    console.log(
      `🚫 Outliers (≥${maxPriceLocal.toLocaleString()} ${currency}): ${
        priceAnalysis.outliers
      }`
    );
    console.log(`🎯 Final count for calculation: ${priceAnalysis.final}`);

    if (priceAnalysis.final === 0) {
      console.log("\n❌ No valid prices found!");
      return null;
    }

    // Calculate statistics in local currency
    allPrices.sort((a, b) => a - b);
    const min = allPrices[0];
    const max = allPrices[allPrices.length - 1];
    const median = allPrices[Math.floor(allPrices.length / 2)];
    const localAverage =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    // Convert to USD if needed
    const usdAverage =
      currency === "USD" ? localAverage : convertToUSD(localAverage, currency);
    const usdMin = currency === "USD" ? min : convertToUSD(min, currency);
    const usdMax = currency === "USD" ? max : convertToUSD(max, currency);
    const usdMedian =
      currency === "USD" ? median : convertToUSD(median, currency);

    console.log(`\n📈 PRICE STATISTICS (Local ${currency}):`);
    console.log(`   💰 Average: ${currency} ${localAverage.toFixed(2)}`);
    console.log(`   📊 Median: ${currency} ${median.toFixed(2)}`);
    console.log(`   📉 Min: ${currency} ${min.toFixed(2)}`);
    console.log(`   📈 Max: ${currency} ${max.toFixed(2)}`);

    if (currency !== "USD") {
      console.log(`\n📈 PRICE STATISTICS (Converted to USD):`);
      console.log(`   💰 Average: $${usdAverage.toFixed(2)}`);
      console.log(`   📊 Median: $${usdMedian.toFixed(2)}`);
      console.log(`   📉 Min: $${usdMin.toFixed(2)}`);
      console.log(`   📈 Max: $${usdMax.toFixed(2)}`);
    }

    // Show sample outliers if any
    if (outliers.length > 0) {
      console.log(
        `\n🚫 OUTLIERS (≥${maxPriceLocal.toLocaleString()} ${currency}) - ${
          outliers.length
        } total:`
      );
      outliers.slice(0, 5).forEach((item) => {
        const usdPrice =
          currency === "USD" ? item.price : convertToUSD(item.price, currency);
        console.log(
          `   💸 ${currency} ${item.price.toLocaleString()} (~$${usdPrice.toFixed(
            2
          )}) - ${item.record.name || "Unnamed listing"}`
        );
        console.log(`       Room type: ${item.record.room_type || "Unknown"}`);
        console.log(`       Raw price: "${item.rawPrice}"`);
      });
      if (outliers.length > 5) {
        console.log(`   ... and ${outliers.length - 5} more outliers`);
      }
    }

    // Show sample invalid prices
    if (invalidPrices.length > 0) {
      console.log(
        `\n❌ INVALID PRICES - ${invalidPrices.length} total (showing first 5):`
      );
      invalidPrices.slice(0, 5).forEach((item) => {
        console.log(`   🚫 ${item.reason}: "${item.rawPrice || "N/A"}"`);
      });
    }

    // Room type breakdown
    console.log(`\n🏠 ROOM TYPE BREAKDOWN (USD):`);
    const roomTypeBreakdown = this.debugRoomTypeBreakdown(
      validPrices,
      currency
    );
    Object.entries(roomTypeBreakdown).forEach(([type, data]) => {
      if (data.count > 0) {
        console.log(
          `   ${type}: ${data.count} listings, avg $${data.average.toFixed(
            2
          )} USD`
        );
      }
    });

    // Show sample valid prices
    console.log(`\n✅ SAMPLE VALID PRICES (first 10, showing USD):`);
    validPrices.slice(0, 10).forEach((item) => {
      const usdPrice =
        currency === "USD" ? item.price : convertToUSD(item.price, currency);
      console.log(
        `   💰 ${currency} ${item.price} (~$${usdPrice.toFixed(2)}) - ${
          item.record.name || "Unnamed"
        } (${item.record.room_type || "Unknown type"})`
      );
    });

    return {
      source,
      analysis: priceAnalysis,
      statistics: {
        local: { min, max, median, average: localAverage, currency },
        usd: {
          min: usdMin,
          max: usdMax,
          median: usdMedian,
          average: usdAverage,
        },
      },
      outliers,
      invalidPrices,
      roomTypeBreakdown,
      sampleListings: validPrices.slice(0, 10),
    };
  }

  debugRoomTypeBreakdown(validPrices, currency = "USD") {
    const breakdown = {
      "Entire place": { total: 0, count: 0, average: 0 },
      "Private room": { total: 0, count: 0, average: 0 },
      "Shared room": { total: 0, count: 0, average: 0 },
      "Other/Unknown": { total: 0, count: 0, average: 0 },
    };

    validPrices.forEach((item) => {
      const roomType = item.record.room_type?.toLowerCase() || "";
      const price = item.price;

      if (roomType.includes("entire")) {
        breakdown["Entire place"].total += price;
        breakdown["Entire place"].count++;
      } else if (roomType.includes("private")) {
        breakdown["Private room"].total += price;
        breakdown["Private room"].count++;
      } else if (roomType.includes("shared")) {
        breakdown["Shared room"].total += price;
        breakdown["Shared room"].count++;
      } else {
        breakdown["Other/Unknown"].total += price;
        breakdown["Other/Unknown"].count++;
      }
    });

    // Calculate averages and convert to USD
    Object.keys(breakdown).forEach((key) => {
      const data = breakdown[key];
      if (data.count > 0) {
        const localAverage = data.total / data.count;
        data.average =
          currency === "USD"
            ? localAverage
            : convertToUSD(localAverage, currency);
      }
    });

    return breakdown;
  }
}
