/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const Chart = require('/opt/nodejs/models/chart.js')

class Block {
  constructor (id) {
    if (!id) {
      throw new Error('Block requires id')
    }
    this.id = id
    this.charts = []
    this.dateStart = null
    this.dateEnd = null
    this.graphType = 1
    this.name = null
    this.dateInterval = 15
    this.intervalUnit = 'minute'
  }

  async get (expand = true) {
    await DB.connect()
    let blockRow = await DB.query('SELECT * FROM blocks WHERE id = ?', [this.id])
    this.dateStart = blockRow[0]['date_start']
    this.dateEnd = blockRow[0]['date_end']
    this.graphType = blockRow[0]['graph_type']
    this.name = blockRow[0]['name']
    this.dateInterval = blockRow[0]['date_interval']
    this.intervalUnit = blockRow[0]['interval_unit']
    let chartRows = await DB.query('SELECT id FROM block_groups WHERE block_id = ?', [this.id])
    if (expand) {
      for (let row of chartRows) {
        this.charts.push(Chart(row['id']).init())
      }
      await Promise.all(this.charts)
    } else {
      for (let row of chartRows) {
        this.charts.push(row['id'])
      }
    }
    return this
  }

  async update (dateStart, dateEnd, graphType, name, dateInterval, intervalUnit) {
    await DB.connect()
    await DB.query('UPDATE blocks SET date_start = ?, date_end = ?, graph_type = ?, name = ?, date_interval = ?, interval_unit = ? WHERE id = ?', [dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, this.id])
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.graphType = graphType
    this.name = name
    this.dateInterval = dateInterval
    this.intervalUnit = intervalUnit
    return this
  }

  async delete (user) {
    // Should probably return error/success
    if (user.privilege > 3) {
      await DB.query('DELETE blocks WHERE id = ?', [this.id])
    } else {
      await DB.query('DELETE blocks RIGHT JOIN stories on blocks.story_id = stories.id WHERE stories.user = ? AND blocks.id = ?', [user.onid, this.id])
    }
  }

  static async create (dateStart, dateEnd, graphType, name, dateInterval, intervalUnit) {
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO blocks (date_start, date_end, graph_type, name, date_interval, interval_unit) VALUES (?, ?, ?, ?, ?, ?)', [dateStart, dateEnd, graphType, name, dateInterval, intervalUnit])
    let block = Block(insertRow['insert_id'])
    block.dateStart = dateStart
    block.dateEnd = dateEnd
    block.graphType = graphType
    block.name = name
    block.dateInterval = dateInterval
    block.intervalUnit = intervalUnit
    return block
  }
}

exports = Block
