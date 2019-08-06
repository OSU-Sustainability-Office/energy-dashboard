/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-03T12:39:57-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-03-14T12:14:09-07:00
 */

// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'

  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'strict-vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'no-multi-spaces': 'off',
    'generator-star-spacing': 'off',
    'camelcase' : [0, { 'properties': 'never' }],
    "strict-vue/require-jsdoc": "off",
		"strict-vue/no-root-store-calls": "error",
		"strict-vue/no-root-store-assets": "error",
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
