// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
  ],

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
