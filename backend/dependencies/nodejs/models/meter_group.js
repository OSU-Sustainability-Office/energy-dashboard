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
  constructor (id) {
    this.meters = []
    this.name = ''
    this.default = false
    this.id = id
  }

  async get (expand = false) {
    await DB.connect()
    let meterGroupRow = await DB.query('SELECT * FROM meter_groups WHERE id = ?', [this.id])
    this.name = meterGroupRow[0]['name']
    this.default = (meterGroupRow[0]['default'] === 1)
    console.log(this.default)
    let metersRow = await DB.query('SELECT meter_id FROM meter_group_relation WHERE group_id = ?', [this.id])
    if (expand) {
      for (let row of metersRow) {
        this.meters.push((new Meter(row['meter_id'])).get())
      }
      this.meters = await Promise.all(this.meters)
    } else {
      for (let row of metersRow) {
        this.meters.push(row['meter_id'])
      }
    }
    return this
  }

  async update (name, meters, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    await Promise.all([
      DB.query('UPDATE meter_groups SET name = ? WHERE id = ?', [name, this.id]),
      DB.query('DELETE meter_group_relation WHERE group_id = ?', [this.id])
    ])
    this.name = name
    this.meters = []
    for (let meter of meters) {
      this.meters.push((new Meter(meter)).get())
      DB.query('INSERT INTO meter_group_relation (meter_id, group_id) VALUES (?, ?)', [meter, this.id])
    }
    this.meters = await Promise.all(this.meters)
    return this
  }

  get
  data () {
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

  async delete (user) {
    if (user.data.privilege > 3) {
      await DB.query('DELETE meter_groups WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated permissions')
    }
  }

  static async create (name, meters, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO meter_groups (name) VALUES (?)', [name])
    let meterPromises = []
    for (let meter of meters) {
      meterPromises.push(
        DB.query('INSERT INTO meter_group_relation (meter_id, group_id) VALUES (?, ?)', [meter, insertRow[0]['insert_id']])
      )
    }
    let meterGroup = new MeterGroup(insertRow[0]['insert_id'])
    meterGroup.name = name
    meterGroup.meters = meters
    await Promise.all(meterPromises)
    return meterGroup
  }
}

module.exports = MeterGroup
