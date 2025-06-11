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
          <!-- Right side buttons -->
          <div class="flex items-center space-x-3">
            <!-- Feedback Button -->
            <button
              @click="showFeedbackModal = true"
              class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-airbnb-rausch font-medium rounded-2xl transition-all"
              title="Report bugs or request features"
            >
              <Icon
                name="heroicons:chat-bubble-left-ellipsis"
                class="w-4 h-4"
              />
              <span class="hidden sm:inline">Feedback</span>
            </button>
            <!-- Notification Bell -->
            <NotificationBell />
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
            <span
              class="text-airbnb-rausch transition-opacity duration-300 ease-in-out"
              :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
              >{{ currentPhrase }}</span
            >
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
            <!-- Main Search Bar -->
            <div
              class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-end mb-4"
            >
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

              <!-- Room Type and Sort Controls -->
              <div class="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4">
                <div class="w-full sm:w-auto">
                  <label class="block text-sm font-semibold text-gray-900 mb-2">
                    Room type
                  </label>
                  <select
                    v-model="roomTypeFilter"
                    class="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 sm:py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-airbnb-rausch transition-all min-w-[140px] text-base"
                  >
                    <option value="averagePrice">All types (avg)</option>
                    <option value="entirePlace">Entire place</option>
                    <option value="privateRoom">Private room</option>
                    <option value="sharedRoom">Shared room</option>
                  </select>
                </div>
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

            <!-- More Filters Toggle -->
            <div class="border-t border-gray-100 pt-4">
              <button
                @click="showMoreFilters = !showMoreFilters"
                class="flex items-center justify-between w-full text-left py-2 px-1 text-sm font-semibold text-gray-700 hover:text-airbnb-rausch transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <Icon
                    name="heroicons:adjustments-horizontal"
                    class="w-4 h-4"
                  />
                  <span>More filters</span>
                  <span
                    v-if="
                      selectedContinents.length > 0 ||
                      stayDuration !== 1 ||
                      enablePriceColors
                    "
                    class="bg-airbnb-rausch text-white text-xs px-2 py-1 rounded-full"
                  >
                    {{
                      (selectedContinents.length > 0 ? 1 : 0) +
                      (stayDuration !== 1 ? 1 : 0) +
                      (enablePriceColors ? 1 : 0)
                    }}
                  </span>
                </div>
                <Icon
                  :name="
                    showMoreFilters
                      ? 'heroicons:chevron-up'
                      : 'heroicons:chevron-down'
                  "
                  class="w-4 h-4 transition-transform"
                />
              </button>

              <!-- Expandable Filters Section -->
              <div
                v-show="showMoreFilters"
                class="mt-4 space-y-4 border-t border-gray-100 pt-4"
              >
                <!-- Continent Filter -->
                <div class="w-full">
                  <label class="block text-sm font-semibold text-gray-900 mb-3">
                    Continents
                  </label>
                  <div
                    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  >
                    <label
                      v-for="continent in availableContinents"
                      :key="continent.value"
                      class="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
                      :class="{
                        'bg-airbnb-rausch border-airbnb-rausch text-white':
                          selectedContinents.includes(continent.value),
                      }"
                    >
                      <input
                        type="checkbox"
                        :value="continent.value"
                        v-model="selectedContinents"
                        class="sr-only"
                      />
                      <div
                        class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all"
                        :class="{
                          'border-white bg-white': selectedContinents.includes(
                            continent.value
                          ),
                          'border-gray-400 bg-transparent':
                            !selectedContinents.includes(continent.value),
                        }"
                      >
                        <Icon
                          v-if="selectedContinents.includes(continent.value)"
                          name="heroicons:check"
                          class="w-3 h-3 text-airbnb-rausch"
                        />
                      </div>
                      <span
                        class="text-sm font-medium"
                        :class="{
                          'text-white': selectedContinents.includes(
                            continent.value
                          ),
                          'text-gray-700': !selectedContinents.includes(
                            continent.value
                          ),
                        }"
                      >
                        {{ continent.label }}
                      </span>
                    </label>
                  </div>
                  <div class="flex justify-between items-center mt-3">
                    <p class="text-xs text-gray-500">
                      {{
                        selectedContinents.length === 0
                          ? "All continents"
                          : `${selectedContinents.length} continent${
                              selectedContinents.length !== 1 ? "s" : ""
                            } selected`
                      }}
                    </p>
                    <button
                      v-if="selectedContinents.length > 0"
                      @click="clearContinentFilter"
                      class="text-xs text-airbnb-rausch hover:text-airbnb-rausch-dark font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <!-- Stay Duration Filter -->
                <div class="w-full">
                  <label class="block text-sm font-semibold text-gray-900 mb-3">
                    <Icon
                      name="heroicons:calendar-days"
                      class="w-4 h-4 inline mr-2 text-gray-400"
                    />
                    Length of stay
                  </label>
                  <select
                    v-model="stayDuration"
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-airbnb-rausch transition-all text-base"
                  >
                    <option
                      v-for="option in stayDurationOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-2">
                    <span v-if="stayDuration === 1">
                      Prices show nightly rates
                    </span>
                    <span v-else>
                      Prices calculated for your entire stay. Note: Longer stay
                      prices are estimates based on nightly rates. Actual costs
                      may be lower as most hosts offer discounts for extended
                      bookings.
                    </span>
                  </p>
                </div>

                <!-- Price Color Coding Toggle -->
                <div class="w-full">
                  <label class="block text-sm font-semibold text-gray-900 mb-3">
                    <Icon
                      name="heroicons:swatch"
                      class="w-4 h-4 inline mr-2 text-gray-400"
                    />
                    Visual price indicator
                  </label>
                  <label
                    class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 cursor-pointer transition-all"
                  >
                    <div>
                      <span class="text-sm font-medium text-gray-900"
                        >Price color coding</span
                      >
                      <p class="text-xs text-gray-500 mt-1">
                        Color cards from green (cheap) to red (expensive)
                      </p>
                    </div>
                    <div class="relative">
                      <input
                        type="checkbox"
                        v-model="enablePriceColors"
                        class="sr-only"
                      />
                      <div
                        class="w-11 h-6 rounded-full transition-colors duration-200 ease-in-out"
                        :class="{
                          'bg-airbnb-rausch': enablePriceColors,
                          'bg-gray-300': !enablePriceColors,
                        }"
                      >
                        <div
                          class="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-y-0.5"
                          :class="{
                            'translate-x-5': enablePriceColors,
                            'translate-x-0.5': !enablePriceColors,
                          }"
                        ></div>
                      </div>
                    </div>
                  </label>
                  <div
                    v-if="enablePriceColors"
                    class="mt-2 flex items-center justify-between text-xs text-gray-500"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-1"
                        style="background-color: hsl(120, 30%, 94%)"
                      ></div>
                      <span>Cheapest</span>
                    </div>
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-1"
                        style="background-color: hsl(60, 30%, 94%)"
                      ></div>
                      <span>Moderate</span>
                    </div>
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-1"
                        style="background-color: hsl(0, 30%, 94%)"
                      ></div>
                      <span>Most expensive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State with Skeleton Cards -->
      <div v-if="loading || (!cities.length && !error)">
        <!-- Skeleton Results Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <div class="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <!-- Skeleton Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="n in 12"
            :key="n"
            class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
          >
            <!-- Skeleton Card Content -->
            <div class="p-6">
              <!-- Skeleton Header with City Info and Price -->
              <div class="flex justify-between items-start mb-6">
                <div class="flex-1 min-w-0">
                  <!-- City name skeleton -->
                  <div
                    class="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"
                  ></div>
                  <!-- Region skeleton -->
                  <div
                    class="h-4 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"
                  ></div>
                  <!-- Country skeleton -->
                  <div
                    class="h-3 bg-gray-200 rounded w-1/3 animate-pulse"
                  ></div>
                </div>
                <div class="text-right ml-4">
                  <!-- Price skeleton -->
                  <div
                    class="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse"
                  ></div>
                  <div class="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>

              <!-- Skeleton Listings Count -->
              <div
                class="flex items-center justify-center py-3 bg-gray-50 rounded-xl mb-4"
              >
                <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>

              <!-- Skeleton Price Breakdown -->
              <div class="space-y-3">
                <div
                  class="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"
                ></div>
                <div class="space-y-2">
                  <div
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      class="h-3 bg-gray-200 rounded w-20 animate-pulse"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 rounded w-12 animate-pulse"
                    ></div>
                  </div>
                  <div
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      class="h-3 bg-gray-200 rounded w-16 animate-pulse"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 rounded w-12 animate-pulse"
                    ></div>
                  </div>
                  <div
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      class="h-3 bg-gray-200 rounded w-18 animate-pulse"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 rounded w-12 animate-pulse"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      <div v-else-if="filteredCities.length && !loading">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ filteredCities.length }} destination{{
                filteredCities.length !== 1 ? "s" : ""
              }}
              found
            </h3>
            <p class="text-gray-600 mt-1">
              <span v-if="stayDuration === 1">
                Showing average nightly rates
              </span>
              <span v-else>
                Showing rates for
                {{
                  stayDurationOptions.find(
                    (option) => option.value === stayDuration
                  )?.label || stayDuration + " nights"
                }}
                <span class="text-gray-500 text-sm block mt-1">
                  Note: Longer stay prices are estimates based on nightly rates.
                  Actual costs may be lower as most hosts offer discounts for
                  extended bookings.
                </span>
              </span>
            </p>
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="city in filteredCities"
            :key="city.id"
            class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer group"
            :class="{
              'bg-white': !enablePriceColors,
            }"
            :style="
              enablePriceColors ? { backgroundColor: getPriceColor(city) } : {}
            "
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
                    ${{ getDisplayPrice(city) }}
                  </div>
                  <div class="text-gray-500 text-xs font-medium">
                    {{ getDisplayPriceLabel() }}
                  </div>
                  <!-- Per-night breakdown for longer stays -->
                  <div
                    v-if="getPerNightPrice(city)"
                    class="text-gray-400 text-xs mt-1"
                  >
                    (${{ getPerNightPrice(city) }} per night)
                  </div>
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
                    <div class="text-right">
                      <span class="text-sm font-semibold text-gray-900">
                        ${{
                          Math.round(
                            city.priceBreakdown.entirePlace * stayDuration
                          )
                        }}
                      </span>
                      <div
                        v-if="stayDuration > 1"
                        class="text-xs text-gray-500"
                      >
                        (${{ city.priceBreakdown.entirePlace }}/night)
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="city.priceBreakdown.privateRoom > 0"
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-700">Private room</span>
                    <div class="text-right">
                      <span class="text-sm font-semibold text-gray-900">
                        ${{
                          Math.round(
                            city.priceBreakdown.privateRoom * stayDuration
                          )
                        }}
                      </span>
                      <div
                        v-if="stayDuration > 1"
                        class="text-xs text-gray-500"
                      >
                        (${{ city.priceBreakdown.privateRoom }}/night)
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="city.priceBreakdown.sharedRoom > 0"
                    class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-700">Shared room</span>
                    <div class="text-right">
                      <span class="text-sm font-semibold text-gray-900">
                        ${{
                          Math.round(
                            city.priceBreakdown.sharedRoom * stayDuration
                          )
                        }}
                      </span>
                      <div
                        v-if="stayDuration > 1"
                        class="text-xs text-gray-500"
                      >
                        (${{ city.priceBreakdown.sharedRoom }}/night)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && cities.length > 0" class="text-center py-16">
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
          @click="clearAllFilters"
          class="text-airbnb-rausch hover:text-airbnb-rausch-dark font-medium transition-colors"
        >
          Show all destinations
        </button>
      </div>

      <!-- Footer Info -->
      <div
        v-if="cities.length && !loading"
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

    <!-- Feedback Modal -->
    <FeedbackModal
      :is-open="showFeedbackModal"
      @close="showFeedbackModal = false"
    />
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
const loading = ref(true);
const error = ref(null);
const searchQuery = ref("");
const sortOrder = ref("asc");
const dataInfo = ref({});
const roomTypeFilter = ref("averagePrice");
const selectedContinents = ref([]);
const showMoreFilters = ref(false);
const stayDuration = ref(1);
const isVisible = ref(true);
const showFeedbackModal = ref(false);
const enablePriceColors = ref(true);

// Rotating phrases for hero section
const phrases = [
  "affordable destinations",
  "beautiful travel gems",
  "budget-friendly treasures",
  "low-cost locations",
];
const currentPhrase = ref(phrases[0]);
let phraseIndex = 0;

// Set up phrase rotation with fade animation
onMounted(() => {
  setInterval(() => {
    // Fade out
    isVisible.value = false;

    // Change text after fade out completes
    setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      currentPhrase.value = phrases[phraseIndex];

      // Fade in
      setTimeout(() => {
        isVisible.value = true;
      }, 50); // Small delay to ensure text change is registered
    }, 300); // Match the transition duration
  }, 10000); // Change every 10 seconds
});

// Available continents for the filter
const availableContinents = [
  { value: "north america", label: "North America" },
  { value: "latin america", label: "Latin America" },
  { value: "europe", label: "Europe" },
  { value: "africa", label: "Africa" },
  { value: "asia", label: "Asia" },
  { value: "oceania", label: "Oceania" },
  { value: "middle east", label: "Middle East" },
];

// Stay duration options
const stayDurationOptions = [
  { value: 1, label: "1 night", displayLabel: "per night" },
  { value: 3, label: "3 nights", displayLabel: "for 3-night stay" },
  { value: 7, label: "1 week", displayLabel: "per week" },
  { value: 14, label: "2 weeks", displayLabel: "for 2-week stay" },
  { value: 30, label: "1 month", displayLabel: "per month" },
];

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

  // Filter by selected continents
  if (selectedContinents.value.length > 0) {
    filtered = filtered.filter((city) => {
      // Check if city has continents data and if any of its continents match the selected ones
      return (
        city.continents &&
        Array.isArray(city.continents) &&
        city.continents.some((continent) =>
          selectedContinents.value.includes(continent)
        )
      );
    });
  }

  // Sort by selected room type with calculated total prices
  filtered.sort((a, b) => {
    let aVal, bVal;
    let aHasData = true;
    let bHasData = true;

    // Get the base price based on selected room type filter
    if (roomTypeFilter.value === "averagePrice") {
      aVal = a.averagePrice;
      bVal = b.averagePrice;
    } else {
      // Check if cities have data for the selected room type
      aVal = a.priceBreakdown?.[roomTypeFilter.value];
      bVal = b.priceBreakdown?.[roomTypeFilter.value];

      aHasData = aVal !== undefined && aVal > 0;
      bHasData = bVal !== undefined && bVal > 0;

      // If no data, use 0 for sorting but we'll handle placement separately
      aVal = aHasData ? aVal : 0;
      bVal = bHasData ? bVal : 0;
    }

    // Calculate total prices based on stay duration
    const aTotalPrice = aHasData ? aVal * stayDuration.value : 0;
    const bTotalPrice = bHasData ? bVal * stayDuration.value : 0;

    // Always put cities without data at the end
    if (!aHasData && !bHasData) return 0;
    if (!aHasData) return 1;
    if (!bHasData) return -1;

    // Normal sorting for cities with data using total prices
    if (sortOrder.value === "asc") {
      return aTotalPrice - bTotalPrice;
    } else {
      return bTotalPrice - aTotalPrice;
    }
  });

  return filtered;
});

const priceRange = computed(() => {
  if (!filteredCities.value.length) return { min: 0, max: 0 };

  const prices = filteredCities.value
    .map((city) => {
      let basePrice;
      if (roomTypeFilter.value === "averagePrice") {
        basePrice = city.averagePrice;
      } else {
        basePrice = city.priceBreakdown?.[roomTypeFilter.value];
        if (basePrice === undefined || basePrice <= 0) {
          return null; // Exclude cities without this room type
        }
      }
      return basePrice * stayDuration.value;
    })
    .filter((price) => price !== null);

  if (prices.length === 0) return { min: 0, max: 0 };

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
});

// Methods
const fetchCities = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch from static JSON file instead of API
    const response = await $fetch("/cities-cache.json");

    // The static file has the data directly in the 'cities' array
    cities.value = response.cities;

    // Set data info from the cached file metadata
    dataInfo.value = {
      cached: true,
      lastProcessed: response.lastUpdated,
      warning: null,
      cacheInfo: {
        exists: true,
        citiesCount: response.citiesCount,
        lastUpdated: response.lastUpdated,
        version: response.version,
      },
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

const getDisplayPrice = (city) => {
  let basePrice;
  if (roomTypeFilter.value === "averagePrice") {
    basePrice = city.averagePrice;
  } else {
    basePrice = city.priceBreakdown?.[roomTypeFilter.value];
    if (basePrice === undefined || basePrice <= 0) {
      return "N/A";
    }
  }

  // Calculate total price based on stay duration
  const totalPrice = basePrice * stayDuration.value;
  return Math.round(totalPrice);
};

const getDisplayPriceLabel = () => {
  const selectedOption = stayDurationOptions.find(
    (option) => option.value === stayDuration.value
  );
  if (roomTypeFilter.value === "averagePrice") {
    return `average ${selectedOption?.displayLabel || "per night"}`;
  } else {
    return `${getRoomTypeLabel(roomTypeFilter.value)} ${
      selectedOption?.displayLabel || "per night"
    }`;
  }
};

const getPerNightPrice = (city) => {
  if (stayDuration.value === 1) return null; // Don't show per-night for single night

  let basePrice;
  if (roomTypeFilter.value === "averagePrice") {
    basePrice = city.averagePrice;
  } else {
    basePrice = city.priceBreakdown?.[roomTypeFilter.value];
    if (basePrice === undefined || basePrice <= 0) {
      return null;
    }
  }

  return Math.round(basePrice);
};

const getRoomTypeLabel = (type) => {
  switch (type) {
    case "entirePlace":
      return "Entire place";
    case "privateRoom":
      return "Private room";
    case "sharedRoom":
      return "Shared room";
    default:
      return "Average price";
  }
};

const clearContinentFilter = () => {
  selectedContinents.value = [];
};

const getPriceColor = (city) => {
  if (!enablePriceColors.value) return "white";

  let basePrice;
  if (roomTypeFilter.value === "averagePrice") {
    basePrice = city.averagePrice;
  } else {
    basePrice = city.priceBreakdown?.[roomTypeFilter.value];
    if (basePrice === undefined || basePrice <= 0) {
      return "white"; // No data for this room type
    }
  }

  const totalPrice = basePrice * stayDuration.value;
  const { min, max } = priceRange.value;

  // If all prices are the same, use neutral color
  if (min === max) return "hsl(60, 20%, 96%)";

  // Calculate position (0 = cheapest, 1 = most expensive)
  const position = (totalPrice - min) / (max - min);

  // Map position to hue: green (120°) → yellow (60°) → red (0°)
  const hue = 120 * (1 - position);

  // Use subtle colors with low saturation and high lightness
  return `hsl(${hue}, 30%, 94%)`;
};

const clearAllFilters = () => {
  searchQuery.value = "";
  selectedContinents.value = [];
  stayDuration.value = 1;
  enablePriceColors.value = false;
  showMoreFilters.value = false;
  fetchCities();
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
