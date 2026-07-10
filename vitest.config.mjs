import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

// Reuse the app's Vite config (the `@` alias, the Vue plugin, svg loader and the
// scss `additionalData`) so tests resolve modules exactly like the running app.
export default defineConfig(configEnv =>
  mergeConfig(viteConfig(configEnv), {
    test: {
      environment: 'jsdom',
      // The default 'forks' pool fails to start workers on some Windows setups
      // ('Timeout waiting for worker to respond'); 'threads' is reliable here.
      pool: 'threads',
      globals: false,
      setupFiles: ['./tests/setup.js'],
      include: ['tests/unit/**/*.spec.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary']
      }
    }
  })
)
