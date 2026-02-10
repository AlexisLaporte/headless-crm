import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isPreview = process.env.HCRM_PREVIEW === 'true';

export default defineConfig({
  plugins: [
    react(),
    ...(!isPreview ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Headless CRM',
        short_name: 'Headless CRM',
        description: 'API-first contact management for people, organizations, deals and campaigns.',
        theme_color: '#1e3a5f',
        background_color: '#f8f9fc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/app',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    })] : []),
  ],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || '5172'}`,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
