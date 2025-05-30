// eslint.config.js

import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  eslintConfigPrettier, // prevent conflicts with Prettier

  // Vue and JavaScript files
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest
      }
    },
    plugins: {
      import: importPlugin,
      vue: vuePlugin
    },
    rules: {
      ...vuePlugin.configs.essential.rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-use-v-if-with-v-for': 'off',
      camelcase: [0, { properties: 'never' }],
      'import/export': 'error',
      'import/no-commonjs': 'error',
      'no-unused-vars': 'off',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }
]
