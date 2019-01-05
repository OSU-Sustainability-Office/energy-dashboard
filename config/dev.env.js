'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ROOT_API: '"http://localhost:3000"',
  HOST_ADDRESS: '"http://localhost:8080"',
  BASE: "''"
})
