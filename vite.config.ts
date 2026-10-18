import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev: forward relative /api calls to the local Node proxy (server/server.js).
    // Prod: Nginx on the VPS proxies /api -> 127.0.0.1:3001.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
