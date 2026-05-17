import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'inline', // إجبار المتصفح على تسجيل السيرفس وركر فوراً جوه الـ HTML
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon.png'],
      manifest: {
        name: '6afra Habit Tracker',
        short_name: '6afra',
        description: 'Premium Minimalist Habit Tracker by 6afra',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true // بيمسح الكاش القديم المهيس عشان يسحب الجديد فورا
      }
    })
  ]
});