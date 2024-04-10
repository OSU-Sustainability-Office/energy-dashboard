const DB = require('/opt/nodejs/sql-access.js')

class PacificPowerRecent {
  async get() {
    // Get Unix TimeStamp for 11:59:59 PM GMT of 7 days ago
    await DB.connect()
    const currentDate = new Date()
    const date = new Date(currentDate)
    date.setDate(date.getDate() - 7)
    date.setUTCHours(23)
    date.setUTCMinutes(59)
    date.setUTCSeconds(59)
    date.setUTCMilliseconds(0)
    const timestamp = Math.floor(date.getTime() / 1000) // Convert milliseconds to seconds

    return DB.query(
      `SELECT time_seconds, pacific_power_meter_id 
      FROM (
          SELECT time_seconds, pacific_power_meter_id,
                 ROW_NUMBER() OVER (PARTITION BY pacific_power_meter_id ORDER BY time_seconds DESC) AS rn
          FROM pacific_power_data
          WHERE time_seconds > ?
      ) AS ranked_data
      WHERE rn = 1
      ORDER BY time_seconds ASC;`,
      [timestamp, timestamp]
    )
  }
}

module.exports = PacificPowerRecent
