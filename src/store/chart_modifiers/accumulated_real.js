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
function findClosest(array, num) {
  return array.reduce((prev, curr) => (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev))
}

function getDeltaAndDaysInMonth(intervalUnit, startDate, dateInterval) {
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
  return [delta * dateInterval, daysInMonth]
}

export default class AccumulatedModifier {
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
  async postGetData(chartData, payload, store, module) {
    const { dateStart, dateEnd, intervalUnit, dateInterval, point } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const startDate = new Date(dateStart * 1000)
    let [delta, curDaysInMonth] = getDeltaAndDaysInMonth(intervalUnit, startDate, dateInterval)

    // Stores date keys for currentData (used for finding nearest valid keys for Weatherford)
    const dateKeysArray = Array.from(currentData.keys())

    for (let i = dateStart; i <= dateEnd; i += delta) {
      const oldDate = new Date(i * 1000)

      // Adjust delta if intervalUnit is 'month' (to account for variable month lengths)
      if (intervalUnit === 'month') {
        let updatedDaysInMonth = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate()
        delta += (updatedDaysInMonth - curDaysInMonth) * SECONDS_PER_DAY
        curDaysInMonth = updatedDaysInMonth
      }
      const adjustedDate = new Date((i + delta) * 1000) // x-axis date value for chart

      let startKey, endKey

      // If array is empty, don't use the nearest valid index algorithm (needed for past 6 hours / past day on Weatherford)
      if (dateKeysArray.length === 0) {
        startKey = delta + i
        endKey = i
      } else {
        // If delta + i is out of range, don't use the nearest valid index algorithm (e.g. make sure May 2 data isn't included if campaign ends May 1)
        if (delta + i < dateEnd) {
          startKey = findClosest(dateKeysArray, delta + i)
        } else {
          startKey = delta + i
        }
        endKey = findClosest(dateKeysArray, i)
      }

      try {
        const startValue = currentData.get(startKey)
        const endValue = currentData.get(endKey)
        if (isNaN(startValue) || isNaN(endValue)) {
          continue
        }
        if (Math.abs(startValue) < Math.abs(endValue)) {
          continue
        }
        if (startValue === 0 || endValue === 0) {
          continue
        }
        let difference = startValue - endValue

        // Steam meters report in 100s of lbs
        if (point === 'total') difference *= 100

        // While some readings are negative for offset purposes, we should
        // still display them as positive readings since negative electricity
        // isn't really what our meters should detect.
        returnData.push({ x: adjustedDate, y: Math.abs(difference) })
      } catch (error) {
        console.log(error)
      }
    }

    // Prevent scenarios where there is only one valid data point
    if (returnData.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = returnData
    } else {
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
      - store (Vuex store)
      - module: (vuex module) module dispatching this function call
    Returns: Nothing (Note: payload is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async preGetData(payload, store, module) {
    let { intervalUnit, dateInterval } = payload
    const startDateObj = new Date(payload.dateStart * 1000)
    const delta = getDeltaAndDaysInMonth(intervalUnit, startDateObj, dateInterval)[0]
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
