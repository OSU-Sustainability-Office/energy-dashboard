/**
  Filename: accumulated_real.js
  Description: Chart modifier for processing and formatting accumulated data
  (e.g., accumulated_real) for all relevant charts on the energy dashboard.
*/

/**
 * Finds the nearest valid key for a given building (mostly intended for correcting
 * manual meter uploads, e.g., Weatherford).
 * Other buildings with automatic meter upload should have the same keys after this function is run.
 */
function findClosest (array, num) {
  return array.reduce((prev, curr) => (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev))
}

export default class LineAccumulatedModifier {
  constructor () {
    this.data = {}
  }
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
      - store (Vuex store)
      - module: (vuex module) module dispatching this function call
    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const { dateStart, dateEnd, intervalUnit, dateInterval, point } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const startDate = new Date(dateStart * 1000)
    let delta = 1
    let monthDays = 1

    // Array that stores keys for the currentData (used for finding nearest valid keys for Weatherford)
    const keysarray = Array.from(currentData.keys())

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
        // Use number of days in the current month to calculate delta
        monthDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
        delta = SECONDS_PER_DAY * monthDays
        break
    }
    delta *= dateInterval

    for (let i = dateStart; i <= dateEnd; i += delta) {
      const oldDate = new Date(i * 1000)

      // Adjust delta if intervalUnit is 'month' (to account for variable month lengths)
      if (intervalUnit === 'month') {
        let monthDaysCurrent = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate()
        delta += (monthDaysCurrent - monthDays) * SECONDS_PER_DAY
        monthDays = monthDaysCurrent
      }
      const dataDate = new Date((i + delta) * 1000) // x-axis date value for chart

      let startKey, endKey

      // If array is empty, don't use the nearest valid index algorithm (needed for past 6 hours / past day on Weatherford)
      if (keysarray.length === 0) {
        startKey = delta + i
        endKey = i
      } else {
        // If delta + i is out of range, don't use the nearest valid index algorithm (e.g. make sure May 2 data isn't included if campaign ends May 1)
        if (delta + i < dateEnd) {
          startKey = findClosest(keysarray, delta + i)
        } else {
          startKey = delta + i
        }
        endKey = findClosest(keysarray, i)
      }

      try {
        // Get the values for the start and end keys
        const startValue = currentData.get(startKey)
        const endValue = currentData.get(endKey)

        // Skip if values are NaN
        if (isNaN(startValue) || isNaN(endValue)) {
          continue
        }
        // Skip if ending value is unexpectedly lower than starting value
        if (Math.abs(startValue) < Math.abs(endValue)) {
          continue
        }
        // Skip if either value is zero
        if (startValue === 0 || endValue === 0) {
          continue
        }
        // Compute the difference between the two values
        let difference = startValue - endValue

        if (point === 'total') {
          // Steam meters report in 100s of lbs
          difference *= 100
        }
        // While some readings are negative for offset purposes, we should
        // still display them as positive readings since negative electricity
        // isn't really what our meters should detect.
        returnData.push({ x: dataDate, y: Math.abs(difference) })
      } catch (error) {
        console.log(error)
      }
    }
    chartData.data = returnData
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
      - store (Vuex store)
      - module: (vuex module) module dispatching this function call
    Returns: Nothing (Note: payload is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async preGetData (payload, store, module) {
    let { intervalUnit, dateInterval } = payload
    let delta = 1
    const startDateObj = new Date(payload.dateStart * 1000)
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
        let monthDays = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 0).getDate()
        if (startDateObj.getDate() > monthDays) monthDays = startDateObj.getDate()
        delta = 86400 * monthDays
        break
    }
    delta *= dateInterval
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
