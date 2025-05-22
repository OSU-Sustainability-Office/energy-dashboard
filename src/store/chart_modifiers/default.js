/**
  Filename: default.js
  Description: Default class for line/bar chart modifiers. This modifier
  is used as a fallback, but should not be relied on as it doesn't perform
  any calculations (i.e. crunching data into weekly/monthly data points).
*/

function getDelta (intervalUnit, startDate, dateInterval) {
  let delta = 1
  let daysInMonth = 1
  switch (intervalUnit) {
    case 'minute':
      delta = 60
      break
    case 'hour':
      delta = 3600
      break
    case 'day':
      delta = 86400
      break
    case 'month':
      // Use number of days in the current month to calculate delta
      daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
      delta = 86400 * daysInMonth
      break
  }
  return delta * dateInterval
}

export default class DefaultModifier {
  /*
    Description: Called after getData function of chart module.
    Since the data is already a time series, this function does not
    need to do any additional calculations.

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
    const { dateStart, dateEnd, intervalUnit, dateInterval, timezoneOffset } = payload
    const currentData = chartData.data
    const result = []
    const startDate = new Date(dateStart * 1000)
    const delta = getDelta(intervalUnit, startDate, dateInterval)

    // Add the data to result array as-is since it is already a time series
    for (let i = dateStart; i <= dateEnd; i += delta) {
      try {
        let timestamp = i + delta

        const curValue = currentData.get(timestamp)
        if (isNaN(curValue)) {
          continue
        }

        // Adjust the timestamp to account for the timezone offset if needed
        timestamp += timezoneOffset || 0

        // Format the data for the chart
        const formattedData = {
          x: new Date(timestamp * 1000),
          y: Math.abs(curValue)
        }
        result.push(formattedData)
      } catch (error) {
        console.log(error)
      }
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
    const { intervalUnit, dateInterval } = payload
    const dataDate = new Date(payload.dateStart * 1000)
    const delta = getDelta(intervalUnit, dataDate, dateInterval)

    // Adjust dateStart to align with data points in the database
    // Round down to 15 minute intervals
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
