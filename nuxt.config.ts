// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxtjs/tailwindcss",
  ],

  // Runtime configuration for environment variables
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    public: {
      // Public keys exposed to client-side
    },
  },

  // Basic DDoS protection and security
  nitro: {
    // Security headers and route rules
    routeRules: {
      "/**": {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
      // Rate limiting for API routes
      "/api/**": {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    },
  },

  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "icon",
          type: "image/svg+xml",
          sizes: "16x16",
          href: "/favicon-16x16.svg",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          sizes: "32x32",
          href: "/favicon.svg",
        },
        { rel: "shortcut icon", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
      ],
    },
  },
});
