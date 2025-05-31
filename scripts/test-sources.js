import { dataSources } from "../server/data/sources.js";

async function testDataSource(source) {
  try {
    console.log(`Testing ${source.cityName}...`);

    const response = await fetch(source.url, { method: "HEAD" });

    if (response.ok) {
      console.log(`✅ ${source.cityName}: OK (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${source.cityName}: Error ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${source.cityName}: ${error.message}`);
    return false;
  }
}

async function testAllSources() {
  console.log("🔍 Testing all data sources...\n");

  let successCount = 0;
  let totalCount = dataSources.length;

  for (const source of dataSources) {
    const success = await testDataSource(source);
    if (success) successCount++;
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
  }

  console.log(
    `\n📊 Results: ${successCount}/${totalCount} sources are working`
  );

  if (successCount < totalCount) {
    console.log(
      "\n❌ Some sources failed. Please verify URLs from https://insideairbnb.com/get-the-data/"
    );
  } else {
    console.log("\n✅ All sources are working correctly!");
  }
}

testAllSources();
