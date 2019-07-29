/*
 * @Author: Brogan
 * @Date:   Monday June 17th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday June 17th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')

class Alert {
  constructor (id) {
    if (!id) {
      throw new Error('Alert needs id')
    }
    this.id = id
    this.user = null
    this.lowThreshold = null
    this.highThreshold = null
    this.point = null
  }

  async get () {
    await DB.connect()
    let alertRow = await DB.query('SELECT * FROM alerts WHERE id = ?', [this.id])
    this.user = alertRow[0]['user']
    this.lowThreshold = alertRow[0]['low']
    this.highThreshold = alertRow[0]['high']
    this.point = alertRow[0]['point']
    return this
  }

  async update (lowThreshold, highThreshold, point) {
    await DB.connect()
    await DB.query('UPDATE alerts SET low = ?, high = ?, point = ? WHERE id = ?', [lowThreshold, highThreshold, point, this.id])
    this.low = lowThreshold
    this.high = highThreshold
    this.point = point
    return this
  }

  async delete (user) {
    if (user.onid === user || user.privilege > 3) {
      await DB.query('DELETE alerts WHERE id = ?', [this.id])
    }
  }

  static async create (user, lowThreshold, highThreshold, point) {
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO alerts (user, low, high, point) VALUES (?, ?, ?, ?)', [user, lowThreshold, highThreshold, point])
    let alert = Alert(insertRow[0]['insert_id'])
    alert.user = user
    alert.lowThreshold = lowThreshold
    alert.highThreshold = highThreshold
    alert.point = point
    return alert
  }

  static async forMeter (meter) {
    await DB.connect()
    let alertRows = await DB.query('SELECT * FROM alerts WHERE meter_id = ?', [meter.id])
    let returnAlerts = []
    for (let alertRow of alertRows) {
      let alert = Alert(alertRow['id'])
      alert.user = alertRow['user_email']
      alert.lowThreshold = alertRow['low']
      alert.highThreshold = alertRow['high']
      alert.point = alertRow['point']
      returnAlerts.push(alert)
    }
    return alertRows
  }
}

module.exports = Alert
