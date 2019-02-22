/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-04T10:05:09-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-01T12:55:07-08:00
 */

module.exports = function (api) {
  api.cache(true)
  const presets = [
    '@vue/app'
  ]
  return {
    presets
  }
}
