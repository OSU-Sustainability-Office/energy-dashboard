/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const meterClasses = require('/opt/nodejs/meter_classes.js')

class Meter {
  constructor (id, address = '') {
    if (!id && address === '') {
      throw new Error('Meter needs id or address')
    }
    this.id = id
    this.name = ''
    this.address = address
    this.classInt = 0
    this.negate = 0
  }

  async get () {
    await DB.connect()
    let row
    if (this.address && this.address !== '') {
      row = await DB.query('SELECT * FROM meters WHERE address = ?', [this.address])
    } else {
      row = await DB.query('SELECT * FROM meters WHERE id = ?', [this.id])
    }

    if (row.length === 0) {
      let notFoundError = new Error('Meter not found')
      notFoundError.name = 'MeterNotFound'
      throw notFoundError
    }

    this.id = row[0]['id']
    this.name = row[0]['name']
    this.address = row[0]['address']
    this.classInt = row[0]['class']
    this.negate = (row[0]['negate'] === 1)
    return this
  }

  get
  data () {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      classInt: this.classInt,
      negate: this.negate
    }
  }

  async download (point, startTime, endTime, meterClass) {
    await DB.connect()
    if (Object.values(meterClasses[meterClass]).includes(point)) {
      return DB.query('SELECT ' + point + ', UNIX_TIMESTAMP(time) AS time FROM data WHERE meter_id = ? AND time >= ? AND time <= ? ORDER BY time ASC', [this.id, startTime, endTime])
    } else {
      throw new Error('Point is not available for given meter class')
    }
  }

  async delete (user) {
    if (user.data.privilege > 3) {
      await DB.connect()
      await DB.query('DELETE meters WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated privileges')
    }
  }

  async upload (data) {
    await DB.connect()
    let points = Object.keys(meterClasses[this.class])

    const pointMap = {
      accumulated_real: null,
      real_power: null,
      reactive_power: null,
      apparent_power: null,
      real_a: null,
      real_b: null,
      real_c: null,
      reactive_a: null,
      reactive_b: null,
      reactive_c: null,
      apparent_a: null,
      apparent_b: null,
      apparent_c: null,
      pf_a: null,
      pf_b: null,
      pf_c: null,
      vphase_ab: null,
      vphase_bc: null,
      vphase_ac: null,
      vphase_an: null,
      vphase_bn: null,
      vphase_cn: null,
      cphase_a: null,
      cphase_b: null,
      cphase_c: null,
      total: null,
      input: null,
      minimum: null,
      maximum: null,
      cubic_feet: null,
      instant: null,
      rate: null,
      default: null
    }
    for (let key of Object.keys(points)) {
      pointMap[points[key]] = data[parseInt(key)]
    }

    await DB.query('INSERT INTO data (meter_id, time, accumulated_real, real_power, reactive_power, apparent_power, real_a, real_b, real_c, reactive_a, reactive_b, reactive_c, apparent_a, apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab, vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn, cphase_a, cphase_b, cphase_c, total, input, minimum, maximum, cubic_feet, instant, rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [this.id, data[0].toString(), pointMap.accumulated_real, pointMap.real_power, pointMap.reactive_power, pointMap.apparent_power, pointMap.real_a, pointMap.real_b, pointMap.real_c, pointMap.reactive_a, pointMap.reactive_b, pointMap.reactive_c, pointMap.apparent_a, pointMap.apparent_b, pointMap.apparent_c, pointMap.pf_a, pointMap.pf_b, pointMap.pf_c, pointMap.vphase_ab, pointMap.vphase_bc, pointMap.vphase_ac, pointMap.vphase_an, pointMap.vphase_bn, pointMap.vphase_cn, pointMap.cphase_a, pointMap.cphase_b, pointMap.cphase_c, pointMap.total, pointMap.input, pointMap.minimum, pointMap.maximum, pointMap.cubic_feet, pointMap.instant, pointMap.rate])
  }

  async update (name, classInt, negate, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated privileges')
    }
    await DB.connect()
    await DB.query('UPDATE meters SET name = ?, class = ?, negate = ? WHERE id = ?', [name, classInt, negate, this.id])
    this.name = name
    this.classInt = classInt
    this.negate = negate
  }

  static async create (name, address, classInt, negate = 0) {
    await DB.connect()
    let returnRow = await DB.query('INSERT INTO meters (name, address, class, negate) values (?, ?, ?, ?)', [name, address, classInt, negate])
    let meter = Meter(returnRow.insertId)
    meter.name = name
    meter.address = address
    meter.class = classInt
    meter.negate = negate
    return meter
  }
}

module.exports = Meter
