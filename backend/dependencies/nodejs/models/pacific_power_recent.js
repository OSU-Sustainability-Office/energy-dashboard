/* 
 * Filename: models/pacific_power_recent.js
 * Description: Defines PacificPowerRecent class and methods to interact with the database.
 */
import { connect, query } from '/opt/nodejs/sql-access.js'

class PacificPowerRecent {
  async get() {
    await connect()

    // see automated-jobs/SEC/readSEC.js for original function
    // Automatically detects the timezone difference of US Pacific vs GMT-0 (7 or 8 depending on daylight savings)
    // https://stackoverflow.com/questions/20712419/get-utc-offset-from-timezone-in-javascript
    const getOffset = timeZone => {
      const timeZoneName = Intl.DateTimeFormat('ia', {
        timeZoneName: 'shortOffset',
        timeZone
      })
        .formatToParts()
        .find(i => i.type === 'timeZoneName').value
      const offset = timeZoneName.slice(3)
      if (!offset) return 0

      const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/)
      if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`

      const [, sign, hour, minute] = matchData
      let result = parseInt(hour) * 60
      if (sign === '+') result *= -1
      if (minute) result += parseInt(minute)

      return result
    }

    // Get Unix TimeStamp for 11:59:59 PM GMT of 7 days ago
    const dateObjUnix = new Date(
      // (days * hours * minutes * seconds * ms)
      new Date().getTime() - (7 * 24 * 60 * 60 * 1000 + getOffset('US/Pacific') * 60 * 1000)
    )

    dateObjUnix.setUTCHours(23, 59, 59, 0)

    const timestamp7DaysAgo = Math.floor(dateObjUnix.getTime() / 1000) // Convert milliseconds to seconds

    return query(
      `SELECT MAX(time) as time, MAX(time_seconds) as time_seconds, pacific_power_meter_id 
      FROM pacific_power_data
      WHERE time_seconds >= ?
      GROUP BY pacific_power_meter_id, DATE(FROM_UNIXTIME(time_seconds))
      ORDER BY pacific_power_meter_id, time_seconds ASC;`,
      [timestamp7DaysAgo]
    )
  }
}

export default PacificPowerRecent
