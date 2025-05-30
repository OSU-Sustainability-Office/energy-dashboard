/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

class MeterGroup {
  constructor(id) {
    this.meters = []
    this.name = ''
    this.default = false
    this.id = id
  }

  set(meters, name, default2) {
    this.meters = meters
    this.name = name
    this.default = default2
  }

  get data() {
    let meters = this.meters
    if (meters.length > 0 && meters[0] instanceof Promise) {
      meters = meters.map(o => o.data)
    }
    return {
      name: this.name,
      id: this.id,
      default: this.default,
      meters: meters
    }
  }
}

module.exports = MeterGroup
