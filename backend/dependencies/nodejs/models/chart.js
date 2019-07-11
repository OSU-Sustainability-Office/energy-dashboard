/*
 * @Author: Brogan
 * @Date:   Monday June 17th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday June 17th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const Building = require('/opt/nodejs/models/building.js')

class Chart {
  constructor (id) {
    if (!id) {
      throw new Error('Chart requires id')
    }
    this.id = id
    this.meters = null
    this.name = ''
    this.point = ''
    this.building = null
  }

  async get () {
    await DB.connect()
    let chartRow = await DB.query('SELECT * FROM block_groups WHERE id = ?', [this.id])
    this.name = chartRow[0]['name']
    this.point = chartRow[0]['point']
    this.meters = await MeterGroup(chartRow[0]['group_id']).get()
    this.building = await Building(chartRow[0]['building_id']).get()
    return this
  }

  async update (name, point, meterGroup, building) {
    await DB.connect()
    await DB.query('UPDATE block_groups SET name = ?, point = ?, group_id = ? building_id = ? WHERE id = ?', [name, point, meterGroup, building, this.id])
    this.name = name
    this.point = point
    this.meters = meterGroup
    this.building = building
    return this
  }

  async delete (user) {
    let storyUser = 'TODO'
    if (user.onid === storyUser || user.privilege > 3) {
      await DB.query('DELETE block_groups WHERE id = ?', [this.id])
    }
  }

  static async create (name, point, meterGroup, building) {
    await DB.connect()
    let insertRow = DB.query('INSERT INTO block_groups (name, point, group_id, building_id) VALUES (?, ?, ?, ?)', [name, point, meterGroup, building])
    let chart = Chart(insertRow.insertId)
    chart.name = name
    chart.meters = meterGroup
    chart.building = building
    return chart
  }
}

exports = Chart
