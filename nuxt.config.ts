import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxthub/core',
    'nuxt-auth-utils',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/icon'
  ],
  devtools: { enabled: true },
  compatibilityDate: '2026-01-01',
  vite: {
    plugins: [
        tailwindcss(),
    ],
  },
  css: ['./app/assets/css/main.css'],
  icon: {
    mode: 'css',
    cssLayer: 'base'
  },
  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: { databaseId: '318e0a43-c098-44b1-98e1-b50b9b7d8685' },
      migrationsDirs: [".output/server/db/migrations/sqlite/"],
      applyMigrationsDuringBuild: false
    },
  },
  $development: {
    hub: {
      db: "sqlite"
    }
  },
  nitro: {
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    experimental: {
      websocket: true
    }
  },
  routeRules: {
    '.**': { prerender: false }
  }
})