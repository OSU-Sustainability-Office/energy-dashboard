const DB = require('/opt/nodejs/sql-access.js')

class PacificPowerExclusion {
  async get() {
    await DB.connect()
    return DB.query(`SELECT * FROM pacific_power_exclusion`)
  }
}

module.exports = PacificPowerExclusion
