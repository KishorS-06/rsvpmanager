import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'maps': ['pigeon-maps'],
          'ui': ['framer-motion', 'react-hot-toast', 'react-icons'],
          'data': ['axios', 'zustand', '@tanstack/react-query'],
          'utils': ['date-fns', 'moment', 'xlsx']
        }
      }
    }
  },
  server: {
    port: 5173
  }
})
