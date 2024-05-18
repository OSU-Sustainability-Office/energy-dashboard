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
  constructor(id, address = '') {
    if (!id && address === '') {
      throw new Error('Meter needs id or address')
    }
    this.id = id
    this.name = ''
    this.address = address
    this.classInt = 0
    this.type = ''
    this.points = []
  }

  async get() {
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
    this.calcProps()
    return this
  }

  set(name, classInt) {
    this.name = name
    this.classInt = classInt
    this.calcProps()
  }

  calcProps() {
    if (this.classInt === null) {
      return
    }
    // switch (this.classInt) {
    //   case 17:
    //     this.type = 'Gas'
    //     break
    //   case 4444:
    //     this.type = 'Steam'
    //     break
    //   default:
    //     this.type = 'Electricity'
    //     break
    // }

    const map = {
      accumulated_real: 'Net Energy Usage (kWh)',
      real_power: 'Real Power (kW)',
      reactive_power: 'Reactive Power (kVAR)',
      apparent_power: 'Apparent Power (VA)',
      real_a: 'Real Power, Phase A (kW)',
      real_b: 'Real Power, Phase B (kW)',
      real_c: 'Real Power, Phase C (kW)',
      reactive_a: 'Reactive Power, Phase A (kVAR)',
      reactive_b: 'Reactive Power, Phase B (kVAR)',
      reactive_c: 'Reactive Power, Phase C (kVAR)',
      pf_a: 'Power Factor, Phase A',
      pf_b: 'Power Factor, Phase B',
      pf_c: 'Power Factor, Phase C',
      vphase_ab: 'Voltage, Phase A-B (V)',
      vphase_bc: 'Voltage, Phase B-C (V)',
      vphase_ac: 'Voltage, Phase A-C (V)',
      vphase_an: 'Voltage, Phase A-N (V)',
      vphase_bn: 'Voltage, Phase B-N (V)',
      vphase_cn: 'Voltage, Phase C-N (V)',
      cphase_a: 'Current, Phase A (A)',
      cphase_b: 'Current, Phase B (A)',
      cphase_c: 'Current, Phase C (A)',
      cubic_feet: 'Total Natural Gas (CF)',
      maximum: 'Maximum',
      minimum: 'Minimum',
      rate: 'Natural Gas Rate (CFm)',
      total: 'Steam (Lbs)',
      input: 'Steam Input',
      apparent_a: 'Apparent Power, Phase A (VA)',
      apparent_b: 'Apparent Power, Phase B (VA)',
      apparent_c: 'Apparent Power, Phase C (VA)',
      baseline_percentage: 'Percentage (%)',
      energy_change: 'Energy Produced (kWh)'
    }
    const points = Object.values(meterClasses[this.classInt])
    for (let point of points) {
      this.points.push({ label: map[point], value: point })
    }
    if (points.indexOf('total') >= 0) {
      this.type = 'Steam'
    } else if (points.indexOf('cubic_feet') >= 0) {
      this.type = 'Gas'
    } else if (points.indexOf('accumulated_real') >= 0) {
      this.type = 'Electricity'
    } else if (points.indexOf('energy_change') >= 0) {
      this.type = 'Solar Panel'
    }
    return this
  }

  get data() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      classInt: this.classInt,
      type: this.type,
      points: this.points
    }
  }

  async download(point, startTime, endTime, meterClass) {
    await DB.connect()
    if (Object.values(meterClasses[meterClass]).includes(point)) {
      // Generalized Meter Types
      if (String(meterClass).startsWith('999')) {
        // get table name from meter table
        let [{ name: meter_table_name }] = await DB.query('SELECT `name` FROM meters WHERE id = ?', [this.id])
        const teslaMeterIds = ['83', '84', '85', '86', '118']
        if (String(meterClass) === '9990001' && teslaMeterIds.includes(String(this.id))) {
          return DB.query(
            'SELECT ' +
              point +
              ", time_seconds AS time, '" +
              this.id +
              "' as id FROM " +
              meter_table_name +
              ' WHERE time_seconds >= ? AND time_seconds <= ?',
            [startTime, endTime]
          )
        } else if (meter_table_name === 'Solar_Meters') {
          return DB.query(
            'SELECT ' +
              point +
              ", time_seconds AS time, '" +
              this.id +
              "' as id FROM " +
              meter_table_name +
              ' WHERE time_seconds >= ? AND time_seconds <= ? AND MeterID = ? order by time_seconds DESC',
            [startTime, endTime, this.id]
          )
        }

        // pacific power meters, may need to change to else-if if there are going to be more custom classes starting with 999
        else {
          let [{ pacific_power_id: pp_id }] = await DB.query('SELECT pacific_power_id FROM meters WHERE id = ?', [
            this.id
          ])
          return DB.query(
            'SELECT ' +
              point +
              ', time_seconds AS time FROM pacific_power_data WHERE time_seconds >= ? AND time_seconds <= ? AND pacific_power_meter_id = ? order by time_seconds DESC;',
            [startTime, endTime, pp_id]
          )
        }
      }
      // Aquisuites
      return DB.query(
        'SELECT ' +
          point +
          ', time_seconds AS time, id FROM data WHERE meter_id = ? AND time_seconds >= ? AND time_seconds <= ? AND (error = "0" OR error IS NULL)',
        [this.id, startTime, endTime]
      )
    } else {
      throw new Error('Point is not available for given meter class')
    }
  }

  // download without explicit point name
  async sparseDownload(point, startTime, endTime, meterClass) {
    await DB.connect()
    if (Object.values(meterClasses[meterClass]).includes(point)) {
      if (String(meterClass).startsWith('999')) {
        // get table name from meter table
        let [{ name: meter_table_name }] = await DB.query('SELECT `name` FROM meters WHERE id = ?', [this.id])
        return DB.query(
          'SELECT ' +
            point +
            ' as reading, time_seconds AS time FROM ' +
            meter_table_name +
            ' WHERE time_seconds >= ? AND time_seconds <= ?',
          [startTime, endTime]
        )
      }
      return DB.query(
        'SELECT ' +
          point +
          ' as reading, time_seconds AS time FROM data WHERE meter_id = ? AND time_seconds >= ? AND time_seconds <= ? AND (error = "0" OR error IS NULL)',
        [this.id, startTime, endTime]
      )
    } else {
      throw new Error('Point is not available for given meter class')
    }
  }

  async delete(user) {
    if (user.data.privilege > 3) {
      await DB.connect()
      await DB.query('DELETE meters WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated privileges')
    }
  }

  async upload(data) {
    await DB.connect()
    console.log(meterClasses)
    let points = meterClasses[this.classInt]

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

    let time = data[0].toString().substring(1, 17) + ':00'
    const timeseconds = new Date(time).getTime() / 1000 - new Date().getTimezoneOffset() * 60
    try {
      await DB.query(
        'INSERT INTO data (meter_id, time, time_seconds, error, accumulated_real, real_power, reactive_power, apparent_power, real_a, real_b, real_c, reactive_a, reactive_b, reactive_c, apparent_a, apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab, vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn, cphase_a, cphase_b, cphase_c, total, input, minimum, maximum, cubic_feet, instant, rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          this.id,
          time,
          timeseconds,
          data[1],
          pointMap.accumulated_real,
          pointMap.real_power,
          pointMap.reactive_power,
          pointMap.apparent_power,
          pointMap.real_a,
          pointMap.real_b,
          pointMap.real_c,
          pointMap.reactive_a,
          pointMap.reactive_b,
          pointMap.reactive_c,
          pointMap.apparent_a,
          pointMap.apparent_b,
          pointMap.apparent_c,
          pointMap.pf_a,
          pointMap.pf_b,
          pointMap.pf_c,
          pointMap.vphase_ab,
          pointMap.vphase_bc,
          pointMap.vphase_ac,
          pointMap.vphase_an,
          pointMap.vphase_bn,
          pointMap.vphase_cn,
          pointMap.cphase_a,
          pointMap.cphase_b,
          pointMap.cphase_c,
          pointMap.total,
          pointMap.input,
          pointMap.minimum,
          pointMap.maximum,
          pointMap.cubic_feet,
          pointMap.instant,
          pointMap.rate
        ]
      )
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && !parseInt(data[1])) {
        console.log(pointMap)
        await DB.query(
          `UPDATE data SET 
                        error = ?, 
                        accumulated_real = ?, 
                        real_power = ?, 
                        reactive_power = ?, 
                        apparent_power = ?, 
                        real_a = ?, 
                        real_b = ?, 
                        real_c = ?, 
                        reactive_a = ?, 
                        reactive_b = ?, 
                        reactive_c = ?, 
                        apparent_a = ?, 
                        apparent_b = ?, 
                        apparent_c = ?, 
                        pf_a = ?, 
                        pf_b = ?, 
                        pf_c = ?, 
                        vphase_ab = ?, 
                        vphase_bc = ?, 
                        vphase_ac = ?, 
                        vphase_an = ?, 
                        vphase_bn = ?, 
                        vphase_cn = ?, 
                        cphase_a = ?, 
                        cphase_b = ?, 
                        cphase_c = ?, 
                        total = ?, 
                        input = ?, 
                        minimum = ?, 
                        maximum = ?, 
                        cubic_feet = ?, 
                        instant = ?, 
                        rate = ?
                        WHERE meter_id = ? AND time = ?`,
          [
            data[1],
            pointMap.accumulated_real,
            pointMap.real_power,
            pointMap.reactive_power,
            pointMap.apparent_power,
            pointMap.real_a,
            pointMap.real_b,
            pointMap.real_c,
            pointMap.reactive_a,
            pointMap.reactive_b,
            pointMap.reactive_c,
            pointMap.apparent_a,
            pointMap.apparent_b,
            pointMap.apparent_c,
            pointMap.pf_a,
            pointMap.pf_b,
            pointMap.pf_c,
            pointMap.vphase_ab,
            pointMap.vphase_bc,
            pointMap.vphase_ac,
            pointMap.vphase_an,
            pointMap.vphase_bn,
            pointMap.vphase_cn,
            pointMap.cphase_a,
            pointMap.cphase_b,
            pointMap.cphase_c,
            pointMap.total,
            pointMap.input,
            pointMap.minimum,
            pointMap.maximum,
            pointMap.cubic_feet,
            pointMap.instant,
            pointMap.rate,
            this.id,
            time
          ]
        )
      } else if (!parseInt(data[1])) {
        // Error on backend not acquisuite
        throw err
      }
    }
  }

  async update(name, classInt, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated privileges')
    }
    await DB.connect()
    await DB.query('UPDATE meters SET name = ?, class = ? WHERE id = ?', [name, classInt, this.id])
    this.name = name
    this.classInt = classInt
  }

  static async create(name, address, classInt) {
    await DB.connect()
    let returnRow = await DB.query('INSERT INTO meters (name, address, class) values (?, ?, ?)', [
      name,
      address,
      classInt
    ])
    let meter = new Meter(returnRow.insertId)
    meter.name = name
    meter.address = address
    meter.class = classInt
    return meter
  }

  static async all(user) {
    if (user.privilege > 3) {
      await DB.connect()
      let meters = await DB.query('SELECT * FROM meters')
      let r = []
      for (let meterQ of meters) {
        let meter = new Meter(meterQ.id)
        meter.id = meterQ['id']
        meter.name = meterQ['name']
        meter.address = meterQ['address']
        meter.classInt = meterQ['class']
        meter.calcProps()
        r.push(meter.data)
      }
      return r
    }
  }
}

module.exports = Meter
