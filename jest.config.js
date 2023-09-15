/*
  Filename: jest.config.js
  Info: This is the jest configuration file for the currently un-used frontend tests.
*/

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: null,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json-summary'],

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'vue'],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: [
    './tests/setupJest.js',
    'fake-indexeddb/auto' // used to mock indexedDB automatically
  ],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,
  // Indicates whether each individual test should be reported during the run
  // verbose: null,
  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],
  // Whether to use watchman for file crawling
  // watchman: true,
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  snapshotSerializers: ['jest-serializer-vue'],

  testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'],

  testURL: 'http://localhost/',
  preset: '@vue/cli-plugin-unit-jest'
}
