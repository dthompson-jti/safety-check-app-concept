import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon-v0.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'maskable-icon-v0.png'],
      manifest: {
        name: 'Safety Check App',
        short_name: 'SafetyCheck',
        description: 'Safety Check Application Concept',
        theme_color: '#f8f9fa',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192-v0.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-v0.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-v0.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  // Configure the base path for GitHub Pages deployment.
  // This should be the name of your repository.
  base: '/safety-check-app-concept/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'jotai'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-toolbar',
            '@radix-ui/react-tooltip',
          ],
          'vendor-heavy': ['framer-motion', '@yudiel/react-qr-scanner'],
        }
      }
    }
  }
})