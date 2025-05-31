import axios from "axios";
import zlib from "zlib";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { dataSources } from "../data/sources.js";
import { CacheManager } from "./cacheManager.js";

const gunzip = promisify(zlib.gunzip);

export class HardPuller {
  constructor() {
    this.baseDataDir = path.join(process.cwd(), "server", "data", "csvs");
    this.downloadCount = 0;
    this.errorCount = 0;
    this.cacheManager = new CacheManager();
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Ensure the csvs data directory exists
  async ensureDataDirectory() {
    try {
      await fs.access(this.baseDataDir);
    } catch {
      console.log(`📁 Creating data directory: ${this.baseDataDir}`);
      await fs.mkdir(this.baseDataDir, { recursive: true });
    }
  }

  // Find cities that are in sources but not in cache
  async getCitiesMissingFromCache() {
    const cachedCities = await this.cacheManager.getCachedCities();
    const cachedIds = new Set(cachedCities.map((city) => city.id));

    const missingCities = dataSources.filter(
      (source) => !cachedIds.has(source.id)
    );

    return {
      missingCities,
      totalSources: dataSources.length,
      totalCached: cachedCities.length,
      missingCount: missingCities.length,
    };
  }

  // Download and save a CSV file from the source for a single city
  async downloadAndSaveCSV(source) {
    try {
      console.log(`⬇️  Downloading ${source.cityName}...`);

      // Download the gzipped CSV
      const response = await axios.get(source.url, {
        responseType: "arraybuffer",
        timeout: 60000, // 60 second timeout for downloads
        headers: {
          "User-Agent": "Educational Research",
        },
      });

      // Decompress the gzipped data
      const decompressed = await gunzip(response.data);

      // Save the CSV file locally
      const filename = `${source.id}.csv`;
      const filepath = path.join(this.baseDataDir, filename);

      await fs.writeFile(filepath, decompressed);

      // Also save metadata
      const metadata = {
        id: source.id,
        cityName: source.cityName,
        country: source.country,
        region: source.region,
        originalUrl: source.url,
        scrapedDate: source.scrapedDate,
        downloadedAt: new Date().toISOString(),
        filename: filename,
        fileSize: decompressed.length,
      };

      const metadataPath = path.join(
        this.baseDataDir,
        `${source.id}_metadata.json`
      );
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      console.log(
        `✅ Saved ${source.cityName} (${Math.round(
          decompressed.length / 1024
        )} KB)`
      );
      this.downloadCount++;

      return { success: true, source, metadata };
    } catch (error) {
      console.error(
        `❌ Failed to download ${source.cityName}: ${error.message}`
      );
      this.errorCount++;
      return { success: false, source, error: error.message };
    }
  }

  async pullAllCSVs() {
    console.log(
      `🚀 Starting hard pull of ${dataSources.length} destinations...`
    );
    console.log(`📂 Data will be saved to: ${this.baseDataDir}`);

    await this.ensureDataDirectory();

    const results = [];

    for (const [index, source] of dataSources.entries()) {
      console.log(
        `\n[${index + 1}/${dataSources.length}] Processing ${
          source.cityName
        }...`
      );

      const result = await this.downloadAndSaveCSV(source);
      results.push(result);

      // Add delay between requests (except for the last one)
      if (index < dataSources.length - 1) {
        console.log("⏳ Waiting 0.5s before next request...");
        await this.delay(500);
      }
    }

    // Save summary
    const summary = {
      totalSources: dataSources.length,
      successful: this.downloadCount,
      failed: this.errorCount,
      results: results,
      completedAt: new Date().toISOString(),
    };

    const summaryPath = path.join(this.baseDataDir, "download_summary.json");
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📊 Hard pull completed:`);
    console.log(`   ✅ Successful: ${this.downloadCount}`);
    console.log(`   ❌ Failed: ${this.errorCount}`);
    console.log(`   📄 Summary saved to: ${summaryPath}`);

    return summary;
  }

  async pullMissingCSVs() {
    console.log(`🎯 Checking which cities are missing from cache...`);

    const { missingCities, totalSources, totalCached, missingCount } =
      await this.getCitiesMissingFromCache();

    console.log(`📊 Cache Status:`);
    console.log(`   📋 Total cities in sources: ${totalSources}`);
    console.log(`   📦 Cities in cache: ${totalCached}`);
    console.log(`   ❌ Missing from cache: ${missingCount}`);

    if (missingCount === 0) {
      console.log(`\n✅ All cities are already in cache! No downloads needed.`);
      return {
        totalSources,
        totalCached,
        missingCount: 0,
        successful: 0,
        failed: 0,
        skipped: totalSources,
        results: [],
      };
    }

    console.log(
      `\n🚀 Starting targeted hard pull of ${missingCount} missing cities...`
    );
    console.log(`📂 Data will be saved to: ${this.baseDataDir}`);

    await this.ensureDataDirectory();

    const results = [];

    for (const [index, source] of missingCities.entries()) {
      console.log(
        `\n[${index + 1}/${missingCount}] Processing ${source.cityName}...`
      );

      const result = await this.downloadAndSaveCSV(source);
      results.push(result);

      // Add delay between requests (except for the last one)
      if (index < missingCities.length - 1) {
        console.log("⏳ Waiting 0.5s before next request...");
        await this.delay(500);
      }
    }

    // Save summary
    const summary = {
      type: "targeted_pull_missing",
      totalSources,
      totalCached,
      missingCount,
      successful: this.downloadCount,
      failed: this.errorCount,
      results: results,
      completedAt: new Date().toISOString(),
    };

    const summaryPath = path.join(
      this.baseDataDir,
      "pull_missing_summary.json"
    );
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📊 Targeted hard pull completed:`);
    console.log(`   🎯 Missing cities found: ${missingCount}`);
    console.log(`   ✅ Successfully downloaded: ${this.downloadCount}`);
    console.log(`   ❌ Failed downloads: ${this.errorCount}`);
    console.log(`   📄 Summary saved to: ${summaryPath}`);

    return summary;
  }

  async getLocalFiles() {
    try {
      await this.ensureDataDirectory();
      const files = await fs.readdir(this.baseDataDir);
      const csvFiles = files.filter((file) => file.endsWith(".csv"));
      const metadataFiles = files.filter((file) =>
        file.endsWith("_metadata.json")
      );

      return {
        csvFiles,
        metadataFiles,
        totalCSVs: csvFiles.length,
        dataDirectory: this.baseDataDir,
      };
    } catch (error) {
      console.error("Error reading local files:", error);
      return { csvFiles: [], metadataFiles: [], totalCSVs: 0 };
    }
  }

  async clearLocalFiles() {
    try {
      await this.ensureDataDirectory();
      const files = await fs.readdir(this.baseDataDir);

      for (const file of files) {
        await fs.unlink(path.join(this.baseDataDir, file));
      }

      console.log(`🗑️  Cleared ${files.length} files from local storage`);
      return { cleared: files.length };
    } catch (error) {
      console.error("Error clearing local files:", error);
      return { cleared: 0, error: error.message };
    }
  }
}
