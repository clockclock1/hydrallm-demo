import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), unocss()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 1024 * 4,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
