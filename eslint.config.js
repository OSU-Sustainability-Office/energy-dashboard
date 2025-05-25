// eslint.config.js

import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import strictVue from 'eslint-plugin-strict-vue'
import importPlugin from 'eslint-plugin-import'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,

  {
    ignores: ['backend/**', 'tests/**', '.gitignore']
  },

  // Vue and JavaScript files
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      camelcase: [0, { properties: 'never' }],
      'space-in-parens': [1, 'never'],
      'space-before-function-paren': ['error', 'always'],
      'import/export': 'error',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  },

  // Vue files
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
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

  // JavaScript files
  {
    files: ['**/*.js'],
    plugins: {
      'strict-vue': strictVue
    },
    rules: {
      'strict-vue/require-jsdoc': 'off',
      'strict-vue/no-root-store-calls': 'error',
      'strict-vue/no-root-store-assets': 'error'
    }
  }
]
