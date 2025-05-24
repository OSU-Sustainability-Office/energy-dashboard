// eslint.config.js

import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import strictVue from 'eslint-plugin-strict-vue'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,

  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      vue,
      'strict-vue': strictVue
    },
    rules: {
      ...vue.configs.essential.rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-use-v-if-with-v-for': 'off'
    }
  },

  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    plugins: {
      'strict-vue': strictVue,
      'import': importPlugin
    },
    rules: {
      'generator-star-spacing': 'off',
      camelcase: [0, { properties: 'never' }],
      'strict-vue/require-jsdoc': 'off',
      'strict-vue/no-root-store-calls': 'error',
      'strict-vue/no-root-store-assets': 'error',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'space-in-parens': [1, 'never'],
      'import/export': 'error'
    }
  }
]