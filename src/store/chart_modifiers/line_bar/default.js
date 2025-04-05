/**
  Filename: default.js
  Description: Default class for line/bar chart modifiers. Assumes data is already
  a time series (e.g. periodic_real_in). This modifier ensures that the number of
  data points is equal to the number of intervals.
*/

export default class LineDefaultModifier {
  constructor () {
    this.data = {}
  }
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
    const {
      dateStart,
      dateEnd,
      intervalUnit,
      dateInterval,
      timeZoneOffset
    } = payload
    const resultDataObject = chartData.data
    const result = []
    const startDate = new Date(dateStart * 1000)
    const SECONDS_PER_DAY = 86400
    let delta = 1
    let monthDays = 1

    // Determine delta based on interval unit
    switch (intervalUnit) {
      case 'minute':
        delta = 60
        break
      case 'hour':
        delta = 3600
        break
      case 'day':
        delta = SECONDS_PER_DAY
        break
      case 'month':
        monthDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
        delta = SECONDS_PER_DAY * monthDays
        break
    }
    delta *= dateInterval

    // set the offset if there is one we need to account for
    const offset = timeZoneOffset || 0

    // Add the data to result array as-is since it is already a time series
    for (let i = dateStart; i <= dateEnd; i += delta) {
      try {
        const value = resultDataObject.get(i + delta)
        if (isNaN(value) || isNaN(resultDataObject.get(i))) {
          continue
        }
        // Format the data for the chart
        const adjustedTimestamp = i + delta + offset
        const formattedData = {
          x: new Date(adjustedTimestamp * 1000),
          y: Math.abs(value)
        }
        result.push(formattedData)
      } catch (error) {
        console.log(error)
      }
    }

    // Fill chart for Solar Panel data
    if (payload.point === 'periodic_real_out') {
      chartData.fill = true
    }

    // Prevent scenarios where there is only one valid data point
    // Shows "No Data" on the campaign buildings sidebar
    if (result.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = result
    } else {
      // Shows "No Data" on the campaign buildings sidebar
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
    const {
      intervalUnit,
      dateInterval,
      point
    } = payload
    const SECONDS_PER_DAY = 86400
    const dataDate = new Date(payload.dateStart * 1000)
    let delta = 1

    switch (intervalUnit) {
      case 'minute':
        delta = 60
        break
      case 'hour':
        delta = 3600
        break
      case 'day':
        delta = SECONDS_PER_DAY
        break
      case 'month':
        let monthDays = new Date(dataDate.getFullYear(), dataDate.getMonth(), 0).getDate()
        if (dataDate.getDate() > monthDays) monthDays = dataDate.getDate()
        delta = SECONDS_PER_DAY * monthDays
        break
    }
    delta *= dateInterval

    // Adjust dateStart to align with data points in the database
    if (point === 'periodic_real_in' || point === 'periodic_real_out') {
      // Round down to 23:59:59
      const adjustedTime = payload.dateStart - delta
      const dayRemainder = adjustedTime % 86400
      // Subtract the remainder to get the start of the day, then add 86399 to round up to 23:59:59
      payload.dateStart = adjustedTime - dayRemainder + 86399
    } else {
      // Round down to 15 minute intervals
      payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
    }
  }
}
