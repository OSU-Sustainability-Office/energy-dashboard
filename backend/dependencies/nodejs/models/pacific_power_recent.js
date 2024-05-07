const DB = require('/opt/nodejs/sql-access.js')

class PacificPowerRecent {
  async get() {
    // Get Unix TimeStamp for 11:59:59 PM GMT of 7 days ago
    await DB.connect()
    const currentDate = new Date()
    const date = new Date(currentDate)
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    date.setUTCSeconds(0)
    date.setUTCMilliseconds(0)
    const endTimestamp = Math.floor(date.getTime() / 1000) // End of today in seconds

    date.setDate(date.getDate() - 7)
    const startTimestamp = Math.floor(date.getTime() / 1000) // 7 days ago in seconds

    return DB.query(
      `SELECT MAX(time) as time, MAX(time_seconds) as time_seconds, pacific_power_meter_id 
      FROM pacific_power_data
      WHERE time_seconds >= ? AND time_seconds <= ?
      GROUP BY pacific_power_meter_id, DATE(FROM_UNIXTIME(time_seconds))
      ORDER BY pacific_power_meter_id, time_seconds ASC;`,
      [startTimestamp, endTimestamp]
    )
  }
}

module.exports = PacificPowerRecent
