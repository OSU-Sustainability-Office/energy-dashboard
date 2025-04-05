/**
  Filename: baseline_perc_total.js
  Description: Chart modifier for processing and formatting the baseline for
  total data (e.g. periodic_real_in) as a percentage. This is displayed
  on the main campaign page with all of the buildings as a line chart.
*/

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
    const rawData = chartData.data
    const {
      baselineData,
      compareStart,
      compareEnd
    } = payload
    const result = []

    for (const currentTimestamp of rawData.keys()) {
      // Shift timestamp backward by the comparison period to align with the baseline range
      const baselineTimestamp = currentTimestamp - (compareEnd - compareStart + 86400)
      const baselineValue = baselineData.get(baselineTimestamp)

      if (!isNaN(baselineValue)) {
        // Calculate the percentage difference
        const currentValue = rawData.get(currentTimestamp)
        const percentageDifference = (currentValue - baselineValue) / baselineValue * 100

        // Format the data for the chart
        const formattedData = {
          x: new Date(currentTimestamp * 1000),
          y: percentageDifference
        }
        result.push(formattedData)
      }
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
