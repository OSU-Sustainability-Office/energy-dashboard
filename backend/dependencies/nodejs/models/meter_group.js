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

  set(meters, name, default2) {
    this.meters = meters
    this.name = name
    this.default = default2
  }

  async update(name, meters, def, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    await Promise.all([
      DB.query('UPDATE meter_groups SET name = ?, `default` = ? WHERE id = ?', [name, def ? 1 : 0, this.id]),
      DB.query('DELETE FROM meter_group_relation WHERE group_id = ?', [this.id])
    ])
    this.name = name
    this.meters = []
    for (let meter of meters) {
      // this.meters.push((new Meter(meter)).get())
      DB.query('INSERT INTO meter_group_relation (meter_id, group_id) VALUES (?, ?)', [meter.id, this.id])
    }
    // this.meters = await Promise.all(this.meters)
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

  async delete(user) {
    if (user.data.privilege > 3) {
      await DB.query('DELETE FROM meter_groups WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated permissions')
    }
  }

  static async deleteBuildingGroups(building, keepList, user) {
    if (user.data.privilege > 3) {
      let keepString = '(' + keepList.join(',') + ')'
      try {
        await DB.query(
          'DELETE meter_group_relation FROM meter_group_relation INNER JOIN meter_groups ON meter_groups.id = meter_group_relation.group_id WHERE NOT (meter_groups.id IN ' +
            keepString +
            ') AND meter_groups.building_id_2 = ? AND meter_groups.building_id IS NULL',
          [building]
        )
        await DB.query(
          'DELETE FROM meter_groups WHERE NOT (id IN ' + keepString + ') AND building_id_2 = ? AND building_id IS NULL',
          [building]
        )
      } catch (e) {
        console.log(e)
      }
    } else {
      throw new Error('Need escalated permissions')
    }
  }

  static async create(name, meters, def, building, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO meter_groups (name, building_id_2, `default`) VALUES (?, ?, ?)', [
      name,
      building,
      def ? 1 : 0
    ])
    console.log(insertRow)
    let meterPromises = []
    for (let meter of meters) {
      meterPromises.push(
        DB.query('INSERT INTO meter_group_relation (meter_id, group_id) VALUES (?, ?)', [
          meter.id,
          insertRow['insertId']
        ])
      )
    }
    let meterGroup = new MeterGroup(insertRow['insertId'])
    meterGroup.name = name
    meterGroup.meters = meters
    await Promise.all(meterPromises)
    return meterGroup
  }
}

module.exports = MeterGroup
