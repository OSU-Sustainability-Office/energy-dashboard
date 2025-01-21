import { defineConfig } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2'
import { createSvgPlugin as svgLoader } from 'vite-plugin-vue2-svg'
import { fileURLToPath } from 'url'
import path from 'path'
import autoprefixer from 'autoprefixer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
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
    plugins: [autoprefixer()]
  },
  server: {
    port: 8080
  }
})
