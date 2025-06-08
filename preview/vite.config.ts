import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'ES2022'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@shopify/polaris',
      '@shopify/app-bridge',
      '@shopify/app-bridge-react'
    ]
  }
});