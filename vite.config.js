import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: 'extensions/test-vite-app'
    }),
    react(),
  ]
})
