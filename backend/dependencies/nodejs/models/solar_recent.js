/*
 * Filename: models/solar_recent.js
 * Description: Defines SolarRecent class and methods to interact with the database.
 */
import { connect, query } from '/opt/nodejs/sql-access.js'

class SolarRecent {
  async get() {
    await connect()

    // Consumed by automated-jobs/SEC/readSEC.js to resume scraping from the day
    // after each meter's last logged reading, rather than only fetching yesterday.
    // Returns raw time_seconds; the caller converts to a Pacific calendar date.
    return query(
      `SELECT MeterID, MAX(time) as time, MAX(time_seconds) as time_seconds
      FROM Solar_Meters
      GROUP BY MeterID
      ORDER BY MeterID ASC;`
    )
  }
}

export default SolarRecent
