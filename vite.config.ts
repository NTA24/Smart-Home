/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'
import type { ProxyOptions } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_DEV_PROXY_API_TARGET?.trim()
  const cameraProxyTarget = env.VITE_DEV_PROXY_CAMERA_TARGET?.trim()

  const proxy: Record<string, ProxyOptions> = {}
  if (apiProxyTarget) {
    proxy['/api/'] = {
      target: apiProxyTarget,
      changeOrigin: true,
      secure: true,
    }
  }
  if (cameraProxyTarget) {
    proxy['/camera-stream/'] = {
      target: cameraProxyTarget,
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/camera-stream\//, '/'),
    }
  }

  return {
    plugins: [
      react(),
      ...(mode === 'analyze'
        ? [
            visualizer({
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
              open: false,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  }
})
