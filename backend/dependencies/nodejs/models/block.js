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
  constructor(id) {
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

  async get(expand = true) {
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
        this.charts.push(new Chart(row['id']).get())
      }
      this.charts = await Promise.all(this.charts)
    } else {
      for (let row of chartRows) {
        this.charts.push(row['id'])
      }
    }
    return this
  }

  async update(dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, user) {
    await DB.connect()
    let responseQuery
    if (user.data.privilege < 3) {
      responseQuery = await DB.query(
        'UPDATE blocks SET date_start = ?, date_end = ?, graph_type = ?, name = ?, date_interval = ?, interval_unit = ? RIGHT JOIN stories on blocks.story_id = stories.id WHERE blocks.id = ? AND stories.user = ?',
        [dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, this.id, user.data.onid]
      )
    } else {
      responseQuery = await DB.query(
        'UPDATE blocks SET date_start = ?, date_end = ?, graph_type = ?, name = ?, date_interval = ?, interval_unit = ? WHERE blocks.id = ?',
        [dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, this.id]
      )
    }
    if (responseQuery['affectedRows'] === 0) {
      throw new Error('Could not update block')
    }
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.graphType = graphType
    this.name = name
    this.dateInterval = dateInterval
    this.intervalUnit = intervalUnit
    return this
  }

  async delete(user) {
    await DB.connect()
    let responseQuery
    if (user.data.privilege > 3) {
      responseQuery = await DB.query('DELETE FROM blocks WHERE id = ?', [this.id])
    } else {
      responseQuery = await DB.query(
        'DELETE FROM blocks RIGHT JOIN stories on blocks.story_id = stories.id WHERE stories.user = ? AND blocks.id = ?',
        [user.onid, this.id]
      )
    }
    if (responseQuery['affectedRows'] === 0) {
      throw new Error('Could not delete Block')
    }
  }

  static async create(dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, storyId, user) {
    await DB.connect()
    let userCheck = await DB.query('SELECT user FROM stories WHERE id = ?', [storyId])
    if (userCheck[0]['user'] !== user.data.onid && user.data.privilege < 3) {
      throw new Error('User can not create story for another user')
    }
    let insertRow = await DB.query(
      'INSERT INTO blocks (date_start, date_end, graph_type, name, date_interval, interval_unit, story_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dateStart, dateEnd, graphType, name, dateInterval, intervalUnit, storyId]
    )
    if (insertRow['affectedRows'] === 0) {
      throw new Error('Unable to create new story')
    }
    let block = new Block(insertRow['insertId'])
    block.dateStart = dateStart
    block.dateEnd = dateEnd
    block.graphType = graphType
    block.name = name
    block.dateInterval = dateInterval
    block.intervalUnit = intervalUnit
    return block
  }

  get data() {
    let charts = this.charts
    if (charts.length > 0 && charts[0] instanceof Chart) {
      charts = charts.map(o => o.data)
    }
    return {
      id: this.id,
      charts: charts,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      graphType: this.graphType,
      name: this.name,
      dateInterval: this.dateInterval,
      intervalUnit: this.intervalUnit
    }
  }
}

module.exports = Block
