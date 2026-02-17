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
      connection: { databaseId: 'cefba871-7dfd-4a4c-b1cb-1c3b10516b62' },
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