export default class LineTotalBaseline {
  constructor () {
    this.dateStart = null
    this.dateEnd = null
  }

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
          data: contains chart data (Map: time -> value (float))
                **Note: must be processed to an array of {x: Date, y: number}
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editing
    this argument will change the chart in the update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const rawData = chartData.data
    const baselineData = payload.baselineData
    const compareStart = payload.compareStart
    const compareEnd = payload.compareEnd
    const result = []

    for (const timestamp of rawData.keys()) {
      const baselineTimestamp = timestamp - (compareEnd - compareStart + 86400) // Adjust timestamp to compare range
      if (isNaN(baselineData.get(baselineTimestamp))) {
        continue
      }
      const baselineValue = baselineData.get(baselineTimestamp)
      if (!isNaN(baselineValue)) {
        result.push({ x: new Date(timestamp * 1000), y: baselineValue })
      }
    }
    chartData.data = result
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: payload is passed by reference so editing
    this argument will change it in the chart update sequence)
  */
  async preGetData (payload, store, module) {
    const meterGroupPath = module.getters.meterGroupPath
    payload.point = 'daily_total'
    const baselinePayload = {
      ...payload,
      dateStart: payload.compareStart,
      dateEnd: payload.compareEnd
    }
    let baselineData = await store.dispatch(meterGroupPath + '/getData', baselinePayload)
    payload['baselineData'] = baselineData
  }
}
