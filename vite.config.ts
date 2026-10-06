import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under any GitHub Pages path (/<repo>/)
  base: './',
  build: {
    // Never inline PDFs as data URIs: browsers refuse to open those in a new tab
    assetsInlineLimit: (file) => (file.endsWith('.pdf') ? false : undefined),
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
