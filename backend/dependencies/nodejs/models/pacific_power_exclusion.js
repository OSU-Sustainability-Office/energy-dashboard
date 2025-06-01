const DB = require('/opt/nodejs/sql-access.js')

class PacificPowerExclusion {
  async get() {
    await DB.connect()
    return DB.query(`SELECT * FROM pacific_power_exclusion`)
  }

  async add(meterID) {
    await DB.connect()
    return DB.query(`INSERT INTO pacific_power_exclusion (pp_meter_id, status, date_added) VALUES (?, ?, ?)`, [
      meterID,
      'new',
      new Date().toISOString()
    ])
  }
}

module.exports = PacificPowerExclusion
