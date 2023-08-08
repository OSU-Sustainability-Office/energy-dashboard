/*
 * @Author: Brogan
 * @Date:   Monday June 17th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday June 17th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')

class Alert {
  constructor(id) {
    if (!id) {
      throw new Error('Alert needs id')
    }
    this.id = id
    this.user = null
    this.lowThreshold = null
    this.highThreshold = null
    this.point = null
    this.meter = null
  }

  async get() {
    await DB.connect()
    let alertRow = await DB.query('SELECT * FROM alerts WHERE id = ?', [this.id])
    this.user = alertRow[0]['user']
    this.lowThreshold = alertRow[0]['low']
    this.highThreshold = alertRow[0]['high']
    this.point = alertRow[0]['point']
    this.meter = alertRow[0]['meter_id']
    return this
  }

  async update(lowThreshold, highThreshold, point, meterId, user) {
    await DB.connect()
    let responseQuery
    if (user.privilege > 3) {
      responseQuery = await DB.query('UPDATE alerts SET low = ?, high = ?, point = ?, meter_id = ? WHERE id = ?', [
        lowThreshold,
        highThreshold,
        point,
        meterId,
        this.id
      ])
    } else {
      responseQuery = await DB.query(
        'UPDATE alerts SET low = ?, high = ?, point = ?, meter_id = ? WHERE id = ? AND user = ?',
        [lowThreshold, highThreshold, point, meterId, this.id, user.onid]
      )
    }
    if (responseQuery['affectedRows'] === 0) {
      throw new Error('Could not update Alert')
    }
    this.low = lowThreshold
    this.high = highThreshold
    this.point = point
    this.meter = meterId
    return this
  }

  async delete(user) {
    await DB.connect()
    let responseQuery
    if (user.privilege > 3) {
      responseQuery = await DB.query('DELETE alerts WHERE id = ?', [this.id])
    } else {
      responseQuery = await DB.query('DELETE alerts WHERE id = ? AND user = ?', [this.id, user.onid])
    }
    if (responseQuery['affectedRows'] === 0) {
      throw new Error('Could not delete Alert')
    }
  }

  static async create(lowThreshold, highThreshold, point, meterId, user) {
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO alerts (user, low, high, point, meter_id) VALUES (?, ?, ?, ?, ?)', [
      user.onid,
      lowThreshold,
      highThreshold,
      point,
      meterId
    ])
    let alert = Alert(insertRow[0]['insert_id'])
    alert.user = user.onid
    alert.lowThreshold = lowThreshold
    alert.highThreshold = highThreshold
    alert.point = point
    return alert
  }

  static async alertsForUser(user) {
    await DB.connect()
    return DB.query('SELECT id FROM alerts WHERE user = ?', [user])
  }

  static async forMeter(meter) {
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
