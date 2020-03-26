/*
 * @Author: you@you.you
 * @Date:   Wednesday March 25th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday March 25th 2020
 * @Copyright:  (c) Oregon State University 2020
 */

export default class LineAccumulatedModifier {
  /*
    Description: Called after getData function of chart module. Create
    a new class following this template if a new modifier type is needed

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
          graphType: graph type (integer 1-4)
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
    let returnData = []
    let delta = 1
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
    }
    delta *= payload.dateInterval
    for (let i = payload.dateStart; i <= payload.dateEnd; i += delta) {
      try {
        let accumulator = 0
        if (isNaN(resultDataObject.get(i + delta)) || isNaN(resultDataObject.get(i))) {
          continue
        }
        accumulator = resultDataObject.get(i + delta) - resultDataObject.get(i)
        returnData.push({ x: (new Date((i + delta) * 1000)), y: accumulator })
      } catch (error) {
        console.log(error)
      }
    }
    chartData.data = returnData
  }

  /*
    Description: Called before getData function of chart module. Create
    a new class following this template if a new modifier type is needed

    Arguments:
      - payload (object)
        {
          point: metering point (string)
          graphType: graph type (integer 1-4)
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

  }
}
