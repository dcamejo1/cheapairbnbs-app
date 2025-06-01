#!/usr/bin/env node

import fs from "fs";
import path from "path";

const CACHE_SOURCE = "server/data/cities-cache.json";
const CACHE_DEST = "public/cities-cache.json";

function syncCacheToPublic() {
  try {
    // Check if source file exists
    if (!fs.existsSync(CACHE_SOURCE)) {
      console.error(`❌ Source cache file not found: ${CACHE_SOURCE}`);
      console.log("💡 Run: node scripts/cacheManager.js repopulate");
      process.exit(1);
    }

    // Ensure public directory exists
    const publicDir = path.dirname(CACHE_DEST);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Copy the cache file
    fs.copyFileSync(CACHE_SOURCE, CACHE_DEST);

    // Get file info for confirmation
    const stats = fs.statSync(CACHE_DEST);
    const sizeKB = (stats.size / 1024).toFixed(1);

    console.log(`✅ Cache synced to public folder`);
    console.log(`📄 File: ${CACHE_DEST}`);
    console.log(`📏 Size: ${sizeKB} KB`);
    console.log(`🕒 Updated: ${stats.mtime.toISOString()}`);

    // Read and display basic info
    const cacheData = JSON.parse(fs.readFileSync(CACHE_DEST, "utf8"));
    console.log(`🏙️  Cities: ${cacheData.citiesCount}`);
    console.log(`📅 Last updated: ${cacheData.lastUpdated}`);
  } catch (error) {
    console.error("❌ Error syncing cache:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncCacheToPublic();
}

export { syncCacheToPublic };
