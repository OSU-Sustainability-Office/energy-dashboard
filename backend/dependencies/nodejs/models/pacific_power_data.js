const DB = require('/opt/nodejs/sql-access.js')

class PacificPowerData {
  async recent() {
    // Get Unix TimeStamp for 11:59:59 PM GMT of 3 days ago
    await DB.connect()
    const currentDate = new Date()
    const date = new Date(currentDate)
    date.setDate(date.getDate() - 3)
    date.setUTCHours(23)
    date.setUTCMinutes(59)
    date.setUTCSeconds(59)
    date.setUTCMilliseconds(0)
    const timestamp = Math.floor(date.getTime() / 1000) // Convert milliseconds to seconds

    return DB.query(
      `SELECT time_seconds, pacific_power_meter_id FROM pacific_power_data
        WHERE time_seconds > ? AND (time_seconds, pacific_power_meter_id) 
        IN (SELECT MAX(time_seconds), pacific_power_meter_id FROM pacific_power_data 
        WHERE time_seconds > ? GROUP BY pacific_power_meter_id) 
        ORDER BY time_seconds ASC`,
      [timestamp, timestamp]
    )
  }
}

module.exports = PacificPowerData
