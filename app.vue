<template>
  <div class="min-h-screen bg-white text-gray-900">
    <NuxtPage />
  </div>
</template>

<script setup>
// Meta tags for the app
useHead({
  title: "Cheap Airbnbs - Find the Most Affordable Cities Worldwide",
  meta: [
    {
      name: "description",
      content:
        "Discover the cheapest Airbnb destinations worldwide. Compare average nightly rates across cities and countries to plan your budget-friendly travels.",
    },
    {
      name: "keywords",
      content:
        "cheap airbnb, budget travel, affordable accommodation, city comparison, travel deals",
    },
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
  link: [
    // Favicons are handled in nuxt.config.ts
  ],
});
</script>

<style>
/* Global Airbnb-inspired styles */
body {
  font-family: "Cereal", "Circular", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background-color: #ffffff;
  color: #222222;
  line-height: 1.43;
}

/* Smooth transitions for interactions */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
