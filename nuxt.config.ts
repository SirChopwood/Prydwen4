import tailwindcss from "@tailwindcss/vite";
import * as trace_events from "node:trace_events";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxthub/core',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    'nuxt-auth-utils'
  ],
  routeRules: {
    "/rrm/**": {ssr: false}
  },
  nitro: {
    preset: "cloudflare-durable",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    },
    experimental: {
      openAPI: true,
      websocket: true
    },
    storage: {
      db: {
        driver: 'fs',
        base: './.data/db'
      }
    }
  },
  css: ['./app/assets/css/tailwind.css'],
  vite: {
    plugins: [
        tailwindcss(),
    ],
  },
  hub: {
    db: 'sqlite'
  },
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
})