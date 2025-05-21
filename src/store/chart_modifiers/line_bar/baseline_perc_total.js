/**
  Filename: baseline_perc_total.js
  Description: Chart modifier for processing and formatting the baseline for
  total data (e.g. periodic_real_in) as a percentage. This is displayed
  on the main campaign page with all of the buildings as a line chart.
  Note: Logic is nearly identical to baseline_total.js, but this gets
  a percentage difference from the baseline instead of a kWh difference.
*/
import { DateTime } from 'luxon'
export default class LineTotalPercModifier {
  /*
    Description: Called after getData function of chart module.

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
        }
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const { baselineData } = payload
    const rawData = chartData.data
    const result = []
    const weekdaySums = Array(7).fill(0)
    const weekdayCounts = Array(7).fill(0)

    // Calculate sum and count for each weekday
    for (const [timestamp, value] of baselineData.entries()) {
      const dt = DateTime.fromSeconds(timestamp, { zone: 'America/Los_Angeles' })
      const weekday = dt.weekday % 7 // 0 = Sunday, 6 = Saturday
      if (!isNaN(value)) {
        weekdaySums[weekday] += value
        weekdayCounts[weekday] += 1
      }
    }

    // Calculate the average for each day of the week
    for (const [currentTimestamp, currentValue] of rawData.entries()) {
      const currentDate = DateTime.fromSeconds(currentTimestamp, { zone: 'America/Los_Angeles' })

      // Get the average value for the current date's weekday
      const weekday = currentDate.weekday % 7
      const count = weekdayCounts[weekday]
      const avg = count > 0 ? weekdaySums[weekday] / count : -1

      // Calculate the percentage difference
      const percentageDifference = ((currentValue - avg) / avg) * 100

      const startOfDay = currentDate.startOf('day').plus({ days: 1 })
      result.push({
        x: startOfDay.toJSDate(),
        y: percentageDifference
      })
    }

    // Prevent scenarios where there is only one valid data point
    if (result.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = result
    } else {
      // Shows "No Data" on the campaign buildings sidebar
      chartData.data = []
    }
  }

  /*
    Description: Called before getData function of chart module.

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
    const meterGroupPath = module.getters.meterGroupPath
    payload.point = 'periodic_real_in'
    const baselinePayload = {
      ...payload,
      dateStart: payload.compareStart,
      dateEnd: payload.compareEnd
    }
    const baselineData = await store.dispatch(meterGroupPath + '/getData', baselinePayload)
    payload['baselineData'] = baselineData
  }
}
