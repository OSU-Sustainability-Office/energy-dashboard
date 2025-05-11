/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const Meter = require('/opt/nodejs/models/meter.js')

class MeterGroup {
  constructor(id) {
    this.meters = []
    this.name = ''
    this.default = false
    this.id = id
  }

  async get(expand = false) {
    await DB.connect()
    let meterGroupRow = await DB.query('SELECT * FROM meter_groups WHERE id = ?', [this.id])
    if (meterGroupRow.length < 1) {
      throw new Error('Meter Group not found')
    }
    this.name = meterGroupRow[0]['name']
    this.default = meterGroupRow[0]['default'] === 1
    let metersRow = await DB.query('SELECT meter_id FROM meter_group_relation WHERE group_id = ?', [this.id])
    if (expand) {
      for (let row of metersRow) {
        this.meters.push(new Meter(row['meter_id']).get())
      }
      this.meters = await Promise.all(this.meters)
    } else {
      for (let row of metersRow) {
        this.meters.push(row['meter_id'])
      }
    }
    return this
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
