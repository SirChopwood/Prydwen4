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
      nodeCompat: true,
      wrangler: {
        observability: {
          enabled: true,
        },
        assets: {
          directory: "./.output/public/",
          binding: "ASSETS"
        },
        // d1_databases: [
        //   {
        //     binding: 'DB',
        //     database_id: '0aaa1682-dbee-49af-a1d8-68299824e654',
        //     migrations_table: "_hub_migrations",
        //     migrations_dir: ".output/server/db/migrations/sqlite/",
        //   }
        // ],
        // durable_objects: {
        //   bindings: [
        //     {
        //       name: "$DurableObject",
        //       class_name: "$DurableObject"
        //     }
        //   ]
        // }
      }
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
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: { databaseId: '0aaa1682-dbee-49af-a1d8-68299824e654' },
      migrationsDirs: [".output/server/db/migrations/sqlite/"],
    },
  },
  $development: {
    hub: {
      db: "sqlite"
    }
  },
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
})