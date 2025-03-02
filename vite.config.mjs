import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { fileURLToPath } from 'url'
import path from 'path'
import autoprefixer from 'autoprefixer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/style-variables.scss" as *;
            @use "sass:color";
            
            `
        }
      }
    },
    postcss: {
      plugins: [autoprefixer()]
    },
    server: {
      port: 8080
    }
  }
})
