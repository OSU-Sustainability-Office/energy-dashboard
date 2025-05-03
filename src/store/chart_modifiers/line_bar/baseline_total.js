/**
  Filename: baseline_total.js
  Description: Chart modifier for processing and formatting the baseline for
  total data (e.g. periodic_real_in) as kWh. This is displayed on each
  of the individual building campaign pages as a line chart.
  Note: Logic is nearly identical to baseline_total_perc.js, but this gets
  a kWh difference from the baseline instead of a percentage difference.
*/
import { DateTime } from 'luxon'
export default class LineTotalBaseline {
  /*
    Description: Called after getData function of chart module.
    Since the data is already a time series, this function does not
    need to do any additional calculations other than shifting the
    timestamp by the comparison period to align with the baseline range.

    Arguments:
      - chartData (object)
        {
          label: chart name (string)
          backgroundColor: color of chart (hex string)
          borderColor: color of chart (hex string)
          fill: specifies to fill the chart, colors underneath the line (bool)
          showLine: specifies interpolation or discrete graphing (bool)
          spanGaps: specifies if null/nan data points should show a line break or not (bool)
          data: contains chart data (Map: time -> value (float))
                **Note: must be processed to an array of {x: Date, y: number}
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

    Returns: Nothing (Note: chartData is passed by reference so editing
    this argument will change the chart in the update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const { baselineData } = payload
    const rawData = chartData.data
    const result = []
    const weekdaySums = Array(7).fill(0)
    const weekdayCounts = Array(7).fill(0)

    // Calculate sum and count for each weekday
    for (const [currentTimestamp, currentValue] of baselineData.entries()) {
      const dt = DateTime.fromSeconds(currentTimestamp, { zone: 'America/Los_Angeles' })
      const weekday = dt.weekday % 7  // 0 = Sunday, 6 = Saturday
      if (!isNaN(currentValue)) {
        weekdaySums[weekday] += currentValue
        weekdayCounts[weekday] += 1
      }
    }

    // Calculate the average for each day of the week
    for (const [currentTimestamp] of rawData.entries()) {
      const currentDate = DateTime.fromSeconds(currentTimestamp, { zone: 'America/Los_Angeles' })

      // Get the average value for the current date's weekday
      const weekday = currentDate.weekday % 7
      const count = weekdayCounts[weekday]
      const avg = count > 0 ? weekdaySums[weekday] / count : -1

      const startOfDay = currentDate.startOf('day')
      result.push({
        x: startOfDay.toJSDate(),
        y: avg
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
    This function gets the raw data from the store using the
    compareStart and compareEnd as a date range.

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

    Returns: Nothing (Note: payload is passed by reference so editing
    this argument will change it in the chart update sequence)
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
