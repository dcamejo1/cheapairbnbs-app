<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:home" class="w-8 h-8 text-airbnb-rausch" />
              <h1 class="text-2xl font-bold text-gray-900">cheapairbnbs</h1>
            </div>
            <p class="text-gray-500 ml-4 hidden sm:block">
              Find affordable stays worldwide
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-white to-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover the world's most
            <span class="text-airbnb-rausch">affordable destinations</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare average Airbnb prices across cities worldwide and find your
            next budget-friendly adventure
          </p>
        </div>

        <!-- Search and Filter Section -->
        <div class="max-w-4xl mx-auto mb-8">
          <div
            class="bg-white rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8"
          >
            <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-end">
              <!-- Search Input -->
              <div class="w-full lg:flex-1">
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Where do you want to explore?
                </label>
                <div class="relative">
                  <Icon
                    name="heroicons:magnifying-glass"
                    class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search destinations..."
                    class="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-airbnb-rausch transition-all text-base"
                  />
                </div>
              </div>

              <!-- Sort Options -->
              <div class="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4">
                <div class="w-full sm:w-auto">
                  <label class="block text-sm font-semibold text-gray-900 mb-2">
                    Sort by price
                  </label>
                  <button
                    @click="toggleSortOrder"
                    class="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 sm:py-4 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch transition-all min-h-[48px] flex items-center justify-center"
                    :title="
                      sortOrder === 'asc'
                        ? 'Currently: Cheapest first. Click to show most expensive first.'
                        : 'Currently: Most expensive first. Click to show cheapest first.'
                    "
                  >
                    <Icon
                      :name="
                        sortOrder === 'asc'
                          ? 'heroicons:arrow-up'
                          : 'heroicons:arrow-down'
                      "
                      class="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading && !cities.length" class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-airbnb-rausch rounded-full mb-6"
        >
          <Icon
            name="heroicons:arrow-path"
            class="w-8 h-8 animate-spin text-white"
          />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Loading destinations
        </h3>
        <p class="text-gray-600">Fetching the latest pricing data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6"
        >
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-8 h-8 text-red-600"
          />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="fetchCities"
          class="bg-airbnb-rausch hover:bg-airbnb-rausch-dark px-6 py-3 rounded-full text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>

      <!-- Cities Grid -->
      <div v-else-if="filteredCities.length">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ filteredCities.length }} destination{{
                filteredCities.length !== 1 ? "s" : ""
              }}
              found
            </h3>
            <p class="text-gray-600 mt-1">Showing average nightly rates</p>
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="city in filteredCities"
            :key="city.id"
            class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer group"
          >
            <!-- Card Content -->
            <div class="p-6">
              <!-- Header with City Info and Price -->
              <div class="flex justify-between items-start mb-6">
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-xl font-bold text-gray-900 group-hover:text-airbnb-rausch transition-colors truncate"
                  >
                    {{ city.cityName }}
                  </h4>
                  <p class="text-gray-600 text-sm">{{ city.region }}</p>
                  <p
                    class="text-gray-500 text-xs uppercase tracking-wider font-medium"
                  >
                    {{ city.country }}
                  </p>
                </div>
                <div class="text-right ml-4">
                  <div class="text-3xl font-bold text-airbnb-rausch">
                    ${{ city.averagePrice }}
                  </div>
                  <div class="text-gray-500 text-xs font-medium">per night</div>
                </div>
              </div>

              <!-- Listings Count -->
              <div
                class="flex items-center justify-center py-3 bg-gray-50 rounded-xl mb-4"
              >
                <Icon
                  name="heroicons:home"
                  class="w-4 h-4 text-gray-400 mr-2"
                />
                <span class="text-sm font-medium text-gray-700">
                  {{ city.totalListings.toLocaleString() }} listings available
                </span>
              </div>

              <!-- Price Breakdown -->
              <div v-if="city.priceBreakdown" class="space-y-3">
                <h5
                  class="text-sm font-semibold text-gray-900 flex items-center"
                >
                  <Icon
                    name="heroicons:currency-dollar"
                    class="w-4 h-4 mr-1 text-gray-400"
                  />
                  Price breakdown
                </h5>
                <div class="space-y-2">
                  <div
                    v-if="city.priceBreakdown.entirePlace > 0"
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-700">Entire place</span>
                    <span class="text-sm font-semibold text-gray-900">
                      ${{ city.priceBreakdown.entirePlace }}
                    </span>
                  </div>
                  <div
                    v-if="city.priceBreakdown.privateRoom > 0"
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-700">Private room</span>
                    <span class="text-sm font-semibold text-gray-900">
                      ${{ city.priceBreakdown.privateRoom }}
                    </span>
                  </div>
                  <div
                    v-if="city.priceBreakdown.sharedRoom > 0"
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-700">Shared room</span>
                    <span class="text-sm font-semibold text-gray-900">
                      ${{ city.priceBreakdown.sharedRoom }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6"
        >
          <Icon name="heroicons:map-pin" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No destinations found
        </h3>
        <p class="text-gray-600 mb-6">
          Try adjusting your search criteria or filters
        </p>
        <button
          @click="
            searchQuery = '';
            fetchCities();
          "
          class="text-airbnb-rausch hover:text-airbnb-rausch-dark font-medium transition-colors"
        >
          Show all destinations
        </button>
      </div>

      <!-- Footer Info -->
      <div
        v-if="cities.length"
        class="mt-16 text-center py-8 border-t border-gray-200"
      >
        <p class="text-gray-500">
          Showing {{ filteredCities.length }} of
          {{ cities.length }} destinations
        </p>
        <p class="text-gray-400 text-sm mt-2">
          Data sourced from
          <a
            href="https://insideairbnb.com"
            target="_blank"
            class="text-airbnb-rausch hover:text-airbnb-rausch-dark underline font-medium"
          >
            Inside Airbnb
          </a>
          • Updated automatically every hour
        </p>
        <p v-if="dataInfo" class="text-gray-400 text-xs mt-1">
          {{ dataInfo.cached ? "Using cached data" : "Fresh data fetched" }} •
          Last processed: {{ formatDate(dataInfo.lastProcessed) }}
          <span v-if="dataInfo.warning" class="text-orange-500">
            • {{ dataInfo.warning }}</span
          >
          <br v-if="dataInfo.cacheInfo" />
          <span
            v-if="dataInfo.cacheInfo && dataInfo.cacheInfo.exists"
            class="text-gray-300"
          >
            Cache: {{ dataInfo.cacheInfo.citiesCount }} cities • Last updated:
            {{ formatDate(dataInfo.cacheInfo.lastUpdated) }}
          </span>
          <span v-else-if="dataInfo.cacheInfo" class="text-gray-300">
            No cache file found
          </span>
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

// Data
const cities = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref("");
const sortBy = ref("averagePrice");
const sortOrder = ref("asc");
const dataInfo = ref({});

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
    const response = await $fetch("/api/cities/test");
    cities.value = response.data;
    dataInfo.value = {
      cached: response.cached,
      lastProcessed: response.lastProcessed,
      warning: response.warning,
      cacheInfo: response.cacheInfo,
    };
  } catch (err) {
    error.value = "Failed to load city data. Please try again.";
    console.error("Error fetching cities:", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

// Lifecycle
onMounted(() => {
  fetchCities();
});
</script>

<style scoped>
/* Airbnb brand colors */
.text-airbnb-rausch {
  color: #ff5a5f;
}

.bg-airbnb-rausch {
  background-color: #ff5a5f;
}

.bg-airbnb-rausch-dark {
  background-color: #e7464b;
}

.hover\:bg-airbnb-rausch-dark:hover {
  background-color: #e7464b;
}

.bg-airbnb-arches {
  background-color: #fc642d;
}

.focus\:ring-airbnb-rausch:focus {
  --tw-ring-color: #ff5a5f;
}

.focus\:border-airbnb-rausch:focus {
  border-color: #ff5a5f;
}

.hover\:text-airbnb-rausch:hover {
  color: #ff5a5f;
}

.hover\:text-airbnb-rausch-dark:hover {
  color: #e7464b;
}

/* Custom gradient backgrounds for cards */
.from-airbnb-rausch {
  --tw-gradient-from: #ff5a5f;
}

.to-airbnb-arches {
  --tw-gradient-to: #fc642d;
}

/* Backdrop blur support for older browsers */
@supports not (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
