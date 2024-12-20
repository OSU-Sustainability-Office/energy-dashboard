import { defineConfig } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2'
import { createSvgPlugin as svgLoader } from 'vite-plugin-vue2-svg'
import path from 'path'

export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/style-variables.scss";'
      }
    }
  },
  postcss: {
    plugins: [require('autoprefixer')]
  }
})
