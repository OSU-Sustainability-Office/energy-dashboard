/* Filename: models/pacific_power_exclusion.js
 * Description: Defines PacificPowerExclusion class and methods to interact with the database.
 */
import { connect, query } from '/opt/nodejs/sql-access.js'

class PacificPowerExclusion {
  async get() {
    await connect()
    return query(`SELECT * FROM pacific_power_exclusion`)
  }

  async add(meterID) {
    await connect()
    return query(`INSERT INTO pacific_power_exclusion (pp_meter_id, status, date_added) VALUES (?, ?, ?)`, [
      meterID,
      'new',
      new Date().toISOString()
    ])
  }
}

export default PacificPowerExclusion
