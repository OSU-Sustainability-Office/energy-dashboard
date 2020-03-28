/*
 * @Author: you@you.you
 * @Date:   Friday March 27th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Friday March 27th 2020
 * @Copyright:  (c) Oregon State University 2020
 */

import Crypto from 'crypto'

/*
  Dead simple hash map cache system
*/
export default class ChartCacher {
  static cache = {}

  static retrieveEntry (payload, path) {
    return ChartCacher.cache[Crypto.createHash('sha256').update(JSON.stringify(payload) + path).digest('hex')]
  }

  static addEntry (payload, path, data) {
    ChartCacher.cache[Crypto.createHash('sha256').update(JSON.stringify(payload) + path).digest('hex')] = data
  }
}
