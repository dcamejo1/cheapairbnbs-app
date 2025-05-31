import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "server/data/cities-cache.json");
const CACHE_VERSION = "1.0";

export class CacheManager {
  async readCache() {
    try {
      const cacheData = await fs.readFile(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(cacheData);

      // Validate cache structure
      if (
        !parsed.version ||
        !parsed.lastUpdated ||
        !Array.isArray(parsed.cities)
      ) {
        console.log("📦 Invalid cache format, will rebuild");
        return null;
      }

      console.log(
        `📦 Cache found with ${
          parsed.cities.length
        } cities (last updated: ${new Date(
          parsed.lastUpdated
        ).toLocaleString()})`
      );
      return parsed;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("📦 No cache file found, will create new one");
      } else {
        console.log("📦 Error reading cache:", error.message);
      }
      return null;
    }
  }

  async writeCache(cities) {
    try {
      const cacheData = {
        version: CACHE_VERSION,
        lastUpdated: new Date().toISOString(),
        citiesCount: cities.length,
        cities: cities,
      };

      // Ensure directory exists
      const dir = path.dirname(CACHE_FILE);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2));
      console.log(`📦 Cache updated with ${cities.length} cities`);
    } catch (error) {
      console.error("📦 Error writing cache:", error.message);
      throw error;
    }
  }

  async getCachedCity(cityId) {
    const cache = await this.readCache();
    if (!cache) return null;

    return cache.cities.find((city) => city.id === cityId);
  }

  async getCachedCities() {
    const cache = await this.readCache();
    return cache ? cache.cities : [];
  }

  async clearCache() {
    try {
      await fs.unlink(CACHE_FILE);
      console.log("📦 Cache cleared successfully");
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("📦 Error clearing cache:", error.message);
      }
    }
  }

  async getCacheInfo() {
    const cache = await this.readCache();
    if (!cache) {
      return {
        exists: false,
        citiesCount: 0,
        lastUpdated: null,
      };
    }

    return {
      exists: true,
      citiesCount: cache.cities.length,
      lastUpdated: cache.lastUpdated,
      version: cache.version,
    };
  }
}
