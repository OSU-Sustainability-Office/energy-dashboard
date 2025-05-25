import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true, // restart mocks before each test
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json-summary'], // coverage report formats
      reportsDirectory: 'coverage', // output folder
    },
    include: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    setupFiles: ['./tests/setupBackendTests.js'],
    globals: true,
    environment: 'node',
  }
})