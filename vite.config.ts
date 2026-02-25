import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/': {
        target: 'https://campus.iot-platform.io.vn',
        changeOrigin: true,
        secure: true,
      },
      '/camera-stream/': {
        target: 'https://camera.iot-platform.io.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/camera-stream\//, '/'),
      },
    },
  },
})
