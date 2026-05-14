import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// City/state SSR pages aren't picked up by Astro's sitemap integration
// (prerender:false → not in the static page index). Read city_data.json at
// build time and feed every URL to `customPages` so they're indexed properly.
const __dirname = dirname(fileURLToPath(import.meta.url));
function loadCityData() {
  // Try the location after PR #3 cleanup, fall back to the legacy root path.
  const candidates = [
    resolve(__dirname, '../../packages/data/city_data.json'),
    resolve(__dirname, '../../city_data.json'),
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, 'utf8'));
    } catch {
      /* try next */
    }
  }
  console.warn('[sitemap] city_data.json not found — sitemap will be incomplete');
  return { cities: [] };
}
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const { cities } = loadCityData();
const SITE = 'https://valuesource.co';
const stateSlugs = [...new Set(cities.map((c) => slugify(c.state)))];
const cityCustomPages = [
  ...stateSlugs.map((s) => `${SITE}/${s}/`),
  ...cities.map((c) => `${SITE}/${slugify(c.state)}/${slugify(c.city)}/`),
];

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  adapter: netlify({
    edgeMiddleware: false,
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      customPages: cityCustomPages,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@lib': '/src/lib',
        '@layouts': '/src/layouts',
      },
    },
    build: {
      // Recharts is expected to be large (~475KB), suppress warning
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split recharts and d3 into separate chunks for better caching
            // These are lazy-loaded only when HistoricalCharts becomes visible
            if (id.includes('node_modules/recharts')) {
              return 'recharts';
            }
            if (id.includes('node_modules/d3-')) {
              return 'd3-libs';
            }
          },
        },
      },
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport',
  },
});
