/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-09T13:26:49-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-09T13:33:15-08:00
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
  }
}
