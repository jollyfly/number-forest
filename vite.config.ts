import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_BASE || '/number-forest/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        id: base,
        name: '数字森林',
        short_name: '数字森林',
        description: '给小朋友的数学森林：认数字、10 以内加减、找规律。',
        lang: 'zh-CN',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'any',
        background_color: '#8fd4f5',
        theme_color: '#3e8f45',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
