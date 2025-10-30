import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, 
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true },
      '/data': { target: 'http://localhost:5000', changeOrigin: true },
      '/drive': { target: 'http://localhost:5000', changeOrigin: true },
      '/gemini': { target: 'http://localhost:5000', changeOrigin: true },
      '/notion': { target: 'http://localhost:5000', changeOrigin: true },
      '/health': { target: 'http://localhost:5000', changeOrigin: true },
    }
  }
})
