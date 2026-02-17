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
      wrangler: {
        observability: {
          enabled: true,
        },
        assets: {
          directory: "./.output/public/",
          binding: "ASSETS"
        },
        d1_databases: [
          {
            binding: 'DB',
            database_id: '318e0a43-c098-44b1-98e1-b50b9b7d8685',
            migrations_table: "_hub_migrations",
            migrations_dir: ".output/server/db/migrations/sqlite/",
          }
        ],
        durable_objects: {
          bindings: [
            {
              name: "$DurableObject",
              class_name: "$DurableObject"
            }
          ]
        }
      }
    },
    experimental: {
      websocket: true
    }
  },
  routeRules: {
    '.**': { prerender: false }
  }
})