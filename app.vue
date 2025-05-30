<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
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
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>

<style>
/* Global dark theme styles */
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  background-color: #111827;
  color: #f9fafb;
}

/* Ensure smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}
</style>
