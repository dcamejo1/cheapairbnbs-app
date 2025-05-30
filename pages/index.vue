<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">CheapAirbnbs</h1>
            <p class="text-gray-400 mt-1">
              Find the world's most affordable destinations
            </p>
          </div>
          <button
            @click="refreshData"
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            <Icon
              name="heroicons:arrow-path"
              class="w-4 h-4 inline mr-2"
              :class="{ 'animate-spin': loading }"
            />
            {{ loading ? "Updating..." : "Refresh Data" }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- Search and Filter Section -->
      <div class="mb-8">
        <div
          class="flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div class="relative flex-1 max-w-md">
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search countries..."
              class="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="sortBy"
              class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="averagePrice">Price</option>
              <option value="cityName">City</option>
              <option value="country">Country</option>
            </select>
            <button
              @click="toggleSortOrder"
              class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icon
                :name="
                  sortOrder === 'asc'
                    ? 'heroicons:bars-arrow-up'
                    : 'heroicons:bars-arrow-down'
                "
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !cities.length" class="text-center py-12">
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4"
        />
        <p class="text-gray-400">Loading city data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-8 h-8 text-red-500 mx-auto mb-4"
        />
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button
          @click="fetchCities"
          class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
        >
          Try Again
        </button>
      </div>

      <!-- Cities Grid -->
      <div
        v-else-if="filteredCities.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="city in filteredCities"
          :key="city.id"
          class="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-white">
                {{ city.cityName }}
              </h3>
              <p class="text-gray-400">{{ city.country }}</p>
              <p
                v-if="city.region !== city.country"
                class="text-gray-500 text-sm"
              >
                {{ city.region }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-400">
                ${{ city.averagePrice }}
              </div>
              <div class="text-gray-400 text-sm">per night</div>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">Total Listings</span>
              <span class="text-white">{{
                city.totalListings.toLocaleString()
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Last Updated</span>
              <span class="text-white">{{ formatDate(city.lastUpdated) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon
          name="heroicons:map-pin"
          class="w-12 h-12 text-gray-500 mx-auto mb-4"
        />
        <p class="text-gray-400 mb-2">No cities found</p>
        <p class="text-gray-500 text-sm">Try adjusting your search criteria</p>
      </div>

      <!-- Stats Footer -->
      <div v-if="cities.length" class="mt-12 text-center">
        <p class="text-gray-400">
          Showing {{ filteredCities.length }} of
          {{ cities.length }} destinations • Data from
          <a
            href="https://insideairbnb.com"
            target="_blank"
            class="text-blue-400 hover:text-blue-300"
            >Inside Airbnb</a
          >
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
// Meta tags for SEO
useHead({
  title: "CheapAirbnbs - Find the World's Most Affordable Destinations",
  meta: [
    {
      name: "description",
      content:
        "Compare average Airbnb prices across global cities. Find the cheapest destinations for your next budget-friendly trip.",
    },
  ],
});

// Reactive state
const cities = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref("");
const sortBy = ref("averagePrice");
const sortOrder = ref("asc");

// Computed properties
const filteredCities = computed(() => {
  let filtered = cities.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (city) =>
        city.cityName.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.region.toLowerCase().includes(query)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value];
    let bVal = b[sortBy.value];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder.value === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  return filtered;
});

// Methods
const fetchCities = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data } = await $fetch("/api/cities/test");
    cities.value = data;
  } catch (err) {
    error.value = "Failed to load city data. Please try again.";
    console.error("Error fetching cities:", err);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  loading.value = true;
  error.value = null;

  try {
    await $fetch("/api/data/update", { method: "POST" });
    await fetchCities();
  } catch (err) {
    error.value = "Failed to update data. Please try again.";
    console.error("Error updating data:", err);
  } finally {
    loading.value = false;
  }
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Lifecycle
onMounted(() => {
  fetchCities();
});
</script>
