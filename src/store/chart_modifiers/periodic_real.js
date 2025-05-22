/**
  Filename: periodic_real.js
  Description: Chart modifier for processing and formatting periodic_real data
  (e.g., periodic_real_in) for all relevant charts on the energy dashboard.
*/
import { DateTime } from 'luxon'

// This function is used for calculating bucket keys for day and week intervals.
// It works by rounding down the current date to the nearest interval boundary
// relative to the provided start date.
function getDayBucketKey (currentDate, startDate, dateInterval) {
  // Compute the different in days between the start date and the current date in the loop
  const dayDifference = Math.floor(currentDate.diff(startDate, 'days').days)

  // Determine the index of the bucket based on the day difference and the date interval
  const bucketIndex = Math.floor(dayDifference / dateInterval)
  const bucketStart = startDate.plus({ days: bucketIndex * dateInterval }).plus({ days: 1 })

  return Math.floor(bucketStart.toSeconds())
}

// Monthly increments are calculated by starting from the first day of the month
// that corresponds to the start date. Data is then accumulated until the same
// day in the following month.
function getMonthBucketKey (currentDate, startDate) {
  // If current date is earlier in the month than day of the
  // start date, then it belongs to the previous month’s bucket
  let bucketMonth = currentDate.month
  let bucketYear = currentDate.year
  if (currentDate.day < startDate.day) {
    bucketMonth -= 1
    if (bucketMonth === 0) {
      bucketMonth = 12
      bucketYear -= 1
    }
  }

  const bucketStart = DateTime.fromObject({
    year: bucketYear,
    month: bucketMonth,
    day: startDate.day,
    hour: 0,
    minute: 0,
    second: 0
  })

  return Math.floor(bucketStart.toSeconds())
}

export default class PeriodicRealModifier {
  /*
    Description: Called after getData function of chart module. Handles
    calculations for data that is collected on a day-to-day basis.

    Arguments:
      - chartData (object)
        {
          label: chart name (string)
          backgroundColor: color of chart (hex string)
          borderColor: color of chart (hex string)
          fill: specifies to fill the chart, colors underneath the line (bool)
          showLine: specifies interpolation or discrete graphing (bool)
          spanGaps: specifies if null/nan data points should show a line break or not (bool)
          data: contains chart data (Map: time: value (float)) **Note: this must be processed to type array of object: {x: time (date), y: value (float)}
        }
      - payload (object)
        {
          point: metering point (string)
          graphType: graph type (integer 1-2)
          dateStart: epoch time in seconds of graph start (integer)
          dateEnd: epoch time in seconds of graph end (integer)
          intervalUnit: unit of interval to group data points by (string: 'minute', 'hour', 'day')
          dateInterval: count of interval units to group data points by (integer)
          timezoneOffset*: timezone of initial timestamp (optional)
        }
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const { dateStart, dateEnd, dateInterval, intervalUnit, point } = payload
    const TIMEZONE = 'America/Los_Angeles'
    const currentData = chartData.data
    const result = []
    const startDate = DateTime.fromSeconds(dateStart, { zone: TIMEZONE }).startOf('day')
    const buckets = new Map()

    // Aggregate data into buckets based on the specified interval
    for (const [epoch, val] of currentData.entries()) {
      const currentDate = DateTime.fromSeconds(epoch, { zone: TIMEZONE })
      let bucketKey
      switch (intervalUnit) {
        case 'minute':
        case 'hour':
          // Skip processing for 'minute' and 'hour' intervals
          continue
        case 'day':
          bucketKey = getDayBucketKey(currentDate, startDate, dateInterval)
          break
        case 'month':
          bucketKey = getMonthBucketKey(currentDate, startDate)
          break
        default:
          console.error('Invalid interval unit:', intervalUnit)
          return
      }

      // Store the aggregated data in the buckets map
      if (bucketKey > dateEnd) continue // ignore current interval (data still being collected)
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, 0)
      }
      buckets.set(bucketKey, buckets.get(bucketKey) + val)
    }

    // Fill the result array with the aggregated data
    for (const [bucketEpoch, total] of buckets.entries()) {
      result.push({
        x: DateTime.fromSeconds(bucketEpoch, { zone: TIMEZONE }).toJSDate(),
        y: Math.abs(total)
      })
    }

    // Fill chart for Solar Panel data only
    if (point === 'periodic_real_out') {
      chartData.fill = true
    }

    // Prevent scenarios where there is only one valid data point
    if (result.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = result
    } else {
      chartData.data = []
    }
  }

  /*
    Description: Called before getData function of chart module.
    Align the start date with a valid data point in the database.
    This is done by rounding the start date down to the nearest
    interval.

    Arguments:
      - payload (object)
        {
          point: metering point (string)
          graphType: graph type (integer 1-2)
          dateStart: epoch time in seconds of graph start (integer)
          dateEnd: epoch time in seconds of graph end (integer)
          intervalUnit: unit of interval to group data points by (string: 'minute', 'hour', 'day')
          dateInterval: count of interval units to group data points by (integer)
        }
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: payload is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async preGetData (payload, store, module) {
    // No preprocessing needed for periodic_real data
  }
}
