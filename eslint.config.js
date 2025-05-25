// eslint.config.js

import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,

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
      vue
    },
    rules: {
      ...vue.configs.essential.rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-use-v-if-with-v-for': 'off',
      indent: ['error', 2, { SwitchCase: 1 }],
      camelcase: [0, { properties: 'never' }],
      'space-in-parens': [1, 'never'],
      'space-before-function-paren': ['error', 'always'],
      'import/export': 'error',
      'import/no-commonjs': 'error',
      'no-unused-vars': 'off',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }
]
