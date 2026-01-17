import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/coretax_bukpot_pdf_to_excel/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['*.svg', '*.png'],
      manifest: {
        name: 'Bukti Potong Converter',
        short_name: 'Bukpot Converter',
        description: 'Convert ZIP Bukti Potong (PDF) ke Excel secara instan dan otomatis',
        theme_color: '#667eea',
        background_color: '#f0f4f8',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        categories: ['productivity', 'utilities', 'finance'],
        icons: [
          {
            src: '/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        runtimeCaching: []
      }
    })
  ],
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
