/**
  Filename: current_total.js
  Description: Chart modifier for processing and formatting total
  data (e.g. daily_total) for all relevant charts on the energy dashboard.
*/

export default class LineTotalCurrent {
  constructor () {
    this.dateStart = null
    this.dateEnd = null
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
    const rawData = chartData.data
    const result = []

    // Add the data to result array as-is since it is already a time series
    for (const [currentTimestamp, value] of rawData.entries()) {
      if (!isNaN(value)) {
        // Format the data for the chart
        const formattedData = {
          x: new Date(currentTimestamp * 1000),
          y: value
        }
        result.push(formattedData)
      }
    }

    // Fill chart for Solar Panel data
    if (payload.point === 'energy_change') {
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
  }
}
