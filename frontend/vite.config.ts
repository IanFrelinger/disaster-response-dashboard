import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    optimizeDeps: {
      include: ['mapbox-gl'],
      exclude: ['@mapbox/mapbox-gl-style-spec']
    },
    build: {
      target: 'esnext',
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          // Disable manual chunks to prevent React from being separated
          // manualChunks: undefined
        },
        external: [],
        onwarn(warning, warn) {
          // Suppress warnings about Mapbox GL JS
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('mapbox-gl')) {
            return
          }
          warn(warning)
        }
      },
      commonjsOptions: {
        include: [/mapbox-gl/, /node_modules/],
        transformMixedEsModules: true
      },
      chunkSizeWarningLimit: 1000
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    // Add specific handling for Mapbox GL JS
    esbuild: {
      target: 'es2020'
    }
  }
})
