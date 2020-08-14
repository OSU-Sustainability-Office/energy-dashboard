/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-09T13:26:49-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-01T14:07:17-08:00
 */

const path = require('path')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: '@import "@/assets/style-variables.scss";'
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/assets/style-variable.scss')
      ]
    }
  },
  chainWebpack: config => {
    config.module.rules.delete("svg");
  },
  configureWebpack: {
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          use: [
            'cache-loader',
            'thread-loader',
            'babel-loader'
          ]
        },
        {
          test: /\.svg$/,
          use: [
            'vue-svg-loader'
          ]
        }
      ]
    }
  }
}
