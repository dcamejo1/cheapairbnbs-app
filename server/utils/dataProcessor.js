import axios from "axios";
import zlib from "zlib";
import { promisify } from "util";
import { parse } from "csv-parse/sync";
import { CacheManager } from "./cacheManager.js";

const gunzip = promisify(zlib.gunzip);

export class DataProcessor {
  constructor() {
    this.cacheManager = new CacheManager();
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processAllSources(sources, forceRefresh = false) {
    console.log(
      `🚀 Processing ${sources.length} sources (forceRefresh: ${forceRefresh})`
    );

    if (!forceRefresh) {
      // Try to get all data from cache first
      const cachedCities = await this.cacheManager.getCachedCities();
      if (cachedCities.length > 0) {
        console.log(`📦 Using cached data for ${cachedCities.length} cities`);
        return cachedCities;
      }
    } else {
      console.log("🔄 Force refresh requested, clearing cache");
      await this.cacheManager.clearCache();
    }

    // Process sources that need fresh data
    const results = [];
    const sourcesToProcess = forceRefresh
      ? sources
      : await this.getSourcesNeedingUpdate(sources);

    console.log(
      `⬬ Need to fetch ${sourcesToProcess.length} cities from Inside Airbnb`
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

        const cityData = await this.processSingleSource(source);
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

        // Add delay between requests (except for the last one)
        if (index < sourcesToProcess.length - 1) {
          console.log("⏳ Waiting 0.5s before next request...");
          await this.delay(500);
        }
      } catch (error) {
        console.error(
          `❌ Failed to download ${source.cityName}: ${error.message}`
        );
        console.error(
          `   Skipping ${source.cityName} due to error: ${error.message}`
        );
      }
    }

    console.log(`📊 Processed ${results.length} cities`);
    return allCities;
  }

  async getSourcesNeedingUpdate(sources) {
    // For now, return sources that aren't in cache
    // Later we could add logic for staleness checks
    const cachedCities = await this.cacheManager.getCachedCities();
    const cachedIds = new Set(cachedCities.map((city) => city.id));

    return sources.filter((source) => !cachedIds.has(source.id));
  }

  async processSingleSource(source) {
    try {
      // Check cache first
      const cached = await this.cacheManager.getCachedCity(source.id);
      if (cached) {
        console.log(`📦 Using cached data for ${source.cityName}`);
        return cached;
      }

      // Download and process from source
      const response = await axios.get(source.url, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
        headers: {
          "User-Agent": "CheapAirbnbs Bot (Educational Research)",
        },
      });

      const decompressed = await gunzip(response.data);
      const csvText = decompressed.toString("utf-8");

      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return this.calculateAveragePrice(source, records);
    } catch (error) {
      console.error(`Error processing ${source.cityName}:`, error.message);
      throw error;
    }
  }

  calculateAveragePrice(source, records) {
    const validListings = records.filter((record) => {
      const price = parseFloat(record.price?.replace(/[$,]/g, ""));
      return !isNaN(price) && price > 0 && price < 10000; // Filter outliers
    });

    if (validListings.length === 0) {
      throw new Error(`No valid listings found for ${source.cityName}`);
    }

    // Calculate overall average
    const prices = validListings.map((record) =>
      parseFloat(record.price.replace(/[$,]/g, ""))
    );
    const averagePrice =
      Math.round(
        (prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100
      ) / 100;

    // Calculate breakdown by room type
    const priceBreakdown = this.calculatePriceBreakdown(validListings);

    return {
      id: source.id,
      cityName: source.cityName,
      country: source.country,
      region: source.region,
      averagePrice,
      totalListings: validListings.length,
      priceBreakdown,
      lastUpdated: new Date().toISOString(),
      scrapedDate: source.scrapedDate,
      sourceUrl: source.url,
    };
  }

  calculatePriceBreakdown(listings) {
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

    // Calculate averages
    return {
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
  }
}
