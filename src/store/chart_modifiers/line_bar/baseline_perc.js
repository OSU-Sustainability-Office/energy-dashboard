/*
 * @Author: you@you.you
 * @Date:   Wednesday March 25th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday March 25th 2020
 * @Copyright:  (c) Oregon State University 2020
 */

export default class LinePercModifier {
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    let resultDataObject = chartData.data
    let keysarray = Array.from(resultDataObject.keys())
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
    function findClosest(array, num) {
      return array.reduce(function(prev, curr) {
        return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
      });
    }
    delta *= payload.dateInterval

    // I ended up not using the below 3 lines, but maybe it's needed for "past 6 hours" or "past day". Need better training data maybe (adjust end date on test campaign)
    let baselineData = payload.baselineData
    // let keysarray2 = Array.from(baselineData.keys())
    let differenceBaseline = new Map()

    for (let i = payload.compareStart; i <= payload.compareEnd; i += delta) {
      // let result2 = findClosest(keysarray2, (delta + i));
      // let result_i2 = findClosest(keysarray2, (i));
      try {
        if (isNaN(baselineData.get(delta + i)) || isNaN(baselineData.get(i))) {
          continue
        }
        differenceBaseline.set(delta + i, baselineData.get(delta + i) - baselineData.get(i))
        // returnData.push({ x: (new Date((i + delta) * 1000)), y: accumulator })
      } catch (error) {
        console.log(error)
      }
    }
    let avgbins = []

    // also don't know if we need findClosest() function calls for the two for loops below, for "past 6 hours" or "past day". Need better training data maybe (adjust end date on test campaign)
    for (let dow = 0; dow < 7; dow++) {
      let startDate = payload.compareStart
      while ((new Date(startDate * 1000)).getDay() !== dow) {
        startDate += (60 * 60 * 24)
      }
      avgbins.push([])
      let begin = startDate
      for (let tod = 0; tod < ((60 * 60 * 24) / delta); tod++) {
        startDate = begin + (tod * delta)
        let count = 0
        let value = -1
        while (startDate <= payload.compareEnd) {
          try {
            if (!isNaN(differenceBaseline.get(startDate))) {
              count++
              value += differenceBaseline.get(startDate)
            }
          } catch (error) {
            console.log(error)
          }
          startDate += (60 * 60 * 24 * 7)
        }
        if (count > 0) value /= count
        avgbins[dow].push(value)
      }
    }
    // after changing the graph for weatherford, I need to subtract delta from payload.dateEnd for some reason
    for (let i = payload.dateStart; i <= (payload.dateEnd - delta); i += delta) {
      let accumulator = 0
      let result;
      let result_delta;
      let result_i;
      if (keysarray === undefined || keysarray.length == 0) {
        result = (delta + i)
        result_delta = delta
        result_i = i
      }
      else {
        result = findClosest(keysarray, (delta + i))
        result_delta = findClosest(keysarray, (delta))
        result_i = findClosest(keysarray, (i))
      }
      try {
        if (isNaN(resultDataObject.get(result)) || isNaN(resultDataObject.get(result_i))) {
          continue
        }
        let baselinePoint = avgbins[(new Date((result) * 1000)).getDay()][Math.floor(((result) % (60 * 60 * 24)) / result_delta)]
        if (baselinePoint !== -1) {
          accumulator = (resultDataObject.get(result) - resultDataObject.get(result_i)) / baselinePoint * 100 - 100

          // hacky check for -100 in weatherford trendline
          if (accumulator != -100) {
            // line below has something to do with the graph with all buildings on it
            returnData.push({ x: (new Date((result) * 1000)), y: (accumulator) })
          }
          console.log(returnData)
        }
      } catch (error) {
        console.log(error)
      }
    }
    console.log(returnData)
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: payload is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async preGetData (payload, store, module) {
    if (payload.intervalUnit === 'day' && payload.dateInterval > 1) {
      throw new Error('Time difference interval to large to work correctly')
    }
    payload.point = 'accumulated_real'
    const meterGroupPath = module.getters.meterGroupPath
    const baselinePayload = {
      ...payload,
      dateStart: payload.compareStart,
      dateEnd: payload.compareEnd
    }
    let baselineData = await store.dispatch(meterGroupPath + '/getData', baselinePayload)
    payload['baselineData'] = baselineData
  }
}
