/**
  Filename: accumulated_real.js
  Description: Chart modifier for computng and displaying
  accumulated values (e.g. accumulated_real) from the chart module.
*/

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
    let resultDataObject = chartData.data

    // array that stores keys for the resultDataObject (used for finding nearest valid keys for Weatherford)
    let keysarray = Array.from(resultDataObject.keys())
    let returnData = []
    let delta = 1
    let startDate = new Date(payload.dateStart * 1000)
    let monthDays = 1

    // Finds the nearest valid keys for a given building (mostly intended for correcting manual meter uploads, e.g. Weatherford.)
    // Other buildings with automatic meter upload should have the same keys after this function is run.
    function findClosest (array, num) {
      return array.reduce(function (prev, curr) {
        return Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
      })
    }

    switch (payload.intervalUnit) {
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
        monthDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
        delta = 60 * 60 * 24 * monthDays
        break
    }
    delta *= payload.dateInterval
    payload.dateStart = payload.dateStart - (payload.dateStart % 900)
    payload.dateEnd = payload.dateEnd - (payload.dateEnd % 900)

    for (let i = payload.dateStart; i <= payload.dateEnd; i += delta) {
      let oldDate = new Date(i * 1000)
      if (payload.intervalUnit === 'month') {
        let monthDaysCurrent = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate()
        delta += (monthDaysCurrent - monthDays) * 24 * 60 * 60
        monthDays = monthDaysCurrent
      }
      let dataDate = new Date((i + delta) * 1000)
      let result
      let result_i

      // If array is empty, don't use the nearest valid index algorithm (needed for past 6 hours / past day on Weatherford)
      if (keysarray === undefined || keysarray.length === 0) {
        result = delta + i
        result_i = i
      } else {
        // If delta + i is out of range, don't use the nearest valid index algorithm (e.g. make sure May 2 data isn't included if campaign ends May 1)
        if (delta + i < payload.dateEnd) {
          result = findClosest(keysarray, delta + i)
        } else {
          result = delta + i
        }
        result_i = findClosest(keysarray, i)
      }

      try {
        let accumulator = 0
        if (isNaN(resultDataObject.get(result)) || isNaN(resultDataObject.get(result_i))) {
          continue
        }
        if (Math.abs(resultDataObject.get(result)) < Math.abs(resultDataObject.get(result_i))) {
          continue
        }
        // If either reading is zero that indicates a missing reading -- do not report.
        if (resultDataObject.get(result) === 0 || resultDataObject.get(result_i) === 0) {
          continue
        }
        accumulator = resultDataObject.get(result) - resultDataObject.get(result_i)

        if (payload.point === 'total') {
          // Steam meters report in 100s of lbs
          accumulator *= 100
        }
        // While some readings are negative for offset purposes, we should
        // still display them as positive readings since negative electricity
        // isn't really what our meters should detect.
        returnData.push({ x: dataDate, y: Math.abs(accumulator) })
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
    let delta = 1
    let dataDate = new Date(payload.dateStart * 1000)
    switch (payload.intervalUnit) {
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
        let monthDays = new Date(dataDate.getFullYear(), dataDate.getMonth(), 0).getDate()
        if (dataDate.getDate() > monthDays) monthDays = dataDate.getDate()
        delta = 60 * 60 * 24 * monthDays
        break
    }
    delta *= payload.dateInterval
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
