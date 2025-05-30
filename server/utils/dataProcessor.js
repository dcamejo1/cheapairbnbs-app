import axios from "axios";
import csv from "csv-parser";
import { createGunzip } from "zlib";

export class DataProcessor {
  constructor() {
    this.results = [];
  }

  // Parse price string like "$70.00" to number
  parsePrice(priceString) {
    if (!priceString) return 0;
    // Remove currency symbols and convert to number
    return parseFloat(priceString.replace(/[$,]/g, ""));
  }

  // Download and process a single CSV.gz file
  async processDataSource(dataSource) {
    try {
      console.log(`Processing ${dataSource.cityName}...`);

      // Download the gzipped CSV file
      const response = await axios({
        method: "GET",
        url: dataSource.url,
        responseType: "stream",
      });

      const results = [];

      // Create a promise to handle the stream processing
      return new Promise((resolve, reject) => {
        response.data
          .pipe(createGunzip()) // Decompress the gzip file
          .pipe(csv()) // Parse CSV
          .on("data", (row) => {
            // Only include valid price data
            const price = this.parsePrice(row.price);
            if (price > 0 && row.room_type) {
              results.push({
                price,
                roomType: row.room_type,
              });
            }
          })
          .on("end", () => {
            // Calculate statistics
            const stats = this.calculateStats(results, dataSource);
            console.log(
              `✅ Processed ${dataSource.cityName}: ${results.length} listings, avg: $${stats.averagePrice}`
            );
            resolve(stats);
          })
          .on("error", (error) => {
            console.error(
              `❌ Error processing ${dataSource.cityName}:`,
              error.message
            );
            reject(error);
          });
      });
    } catch (error) {
      console.error(
        `❌ Failed to download ${dataSource.cityName}:`,
        error.message
      );
      throw error;
    }
  }

  // Calculate average prices and breakdowns
  calculateStats(listings, dataSource) {
    if (listings.length === 0) {
      return {
        ...dataSource,
        averagePrice: 0,
        totalListings: 0,
        priceBreakdown: {
          entirePlace: 0,
          privateRoom: 0,
          sharedRoom: 0,
        },
      };
    }

    // Calculate overall average
    const totalPrice = listings.reduce(
      (sum, listing) => sum + listing.price,
      0
    );
    const averagePrice = Math.round((totalPrice / listings.length) * 100) / 100;

    // Calculate breakdown by room type
    const roomTypes = {
      "Entire home/apt": "entirePlace",
      "Private room": "privateRoom",
      "Shared room": "sharedRoom",
    };

    const priceBreakdown = {};
    Object.keys(roomTypes).forEach((roomType) => {
      const filtered = listings.filter((l) => l.roomType === roomType);
      if (filtered.length > 0) {
        const avg =
          filtered.reduce((sum, l) => sum + l.price, 0) / filtered.length;
        priceBreakdown[roomTypes[roomType]] = Math.round(avg * 100) / 100;
      } else {
        priceBreakdown[roomTypes[roomType]] = 0;
      }
    });

    return {
      id: dataSource.id,
      cityName: dataSource.cityName,
      country: dataSource.country,
      region: dataSource.region,
      averagePrice,
      currency: "USD",
      totalListings: listings.length,
      lastUpdated: new Date(),
      dataSource: {
        url: dataSource.url,
        scrapedDate: dataSource.scrapedDate,
      },
      priceBreakdown,
    };
  }

  // Process all data sources
  async processAllSources(dataSources) {
    const results = [];

    for (const source of dataSources) {
      try {
        const stats = await this.processDataSource(source);
        results.push(stats);
      } catch (error) {
        console.error(
          `Skipping ${source.cityName} due to error:`,
          error.message
        );
      }
    }

    return results;
  }
}
