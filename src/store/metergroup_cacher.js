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

  TODO: this should check an incoming request and see if the incoming request
  is a subset of data we already downloaded
*/
export default class MeterGroupCacher {
  static cache = {}

  static retrieveEntry (payload, path) {
    const correctedPayload = {
      dateStart: payload.dateStart,
      dateEnd: payload.dateEnd,
      point: payload.point
    }
    let s = Crypto.createHash('sha256').update(JSON.stringify(correctedPayload) + path).digest('hex')
    // let s = JSON.stringify(correctedPayload) + path

    let obj = MeterGroupCacher.cache[s]
    if (obj) {
      return new Map(obj)
    } else {
      return null
    }
  }

  static addEntry (payload, path, data) {
    const correctedPayload = {
      dateStart: payload.dateStart,
      dateEnd: payload.dateEnd,
      point: payload.point
    }
    let s = Crypto.createHash('sha256').update(JSON.stringify(correctedPayload) + path).digest('hex')
    // let s = JSON.stringify(correctedPayload) + path
    MeterGroupCacher.cache[s] = new Map(data)
  }
}
