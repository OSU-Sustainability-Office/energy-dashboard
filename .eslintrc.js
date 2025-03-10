/*
  Filename: .eslintrc.js
  Info: eslint settings
*/

// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  env: {
    browser: true,
    es2022: true
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: ['vue', 'strict-vue'],
  // add your custom rules here
  rules: {
    // allow async-await
    'vue/multi-word-component-names': 'off',
    'no-multi-spaces': 'off',
    'generator-star-spacing': 'off',
    camelcase: [0, { properties: 'never' }],
    'strict-vue/require-jsdoc': 'off',
    'strict-vue/no-root-store-calls': 'error',
    'strict-vue/no-root-store-assets': 'error',
    'vue/no-use-v-if-with-v-for': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-in-parens': [1, 'never']
  }
}
