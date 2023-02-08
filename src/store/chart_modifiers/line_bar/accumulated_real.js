/**
  Filename: accumulated_real.js
  Info: Chart math & setup for accumulated real meter point.
*/
export default class LineAccumulatedModifier {
  constructor () {
    this.data = {}
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
    // console.log(resultDataObject)
    // console.log(Array.from(resultDataObject.keys()))
    let keysarray = Array.from(resultDataObject.keys())
    
    let returnData = []
    let delta = 1
    let startDate = (new Date((payload.dateStart) * 1000))
    let monthDays = 1
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
        monthDays = (new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)).getDate()
        delta = 60 * 60 * 24 * monthDays
        break
    }
    delta *= payload.dateInterval
    payload.dateStart = payload.dateStart - (payload.dateStart % 900)
    payload.dateEnd = payload.dateEnd - (payload.dateEnd % 900)

    for (let i = payload.dateStart; i <= payload.dateEnd; i += delta) {
      let oldDate = (new Date(i * 1000))
      if (payload.intervalUnit === 'month') {
        let monthDaysCurrent = (new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0)).getDate()
        delta += (monthDaysCurrent - monthDays) * 24 * 60 * 60
        monthDays = monthDaysCurrent
      }
      let dataDate = (new Date((i + delta) * 1000))

      // console.log(i + delta + ' i + delta')
      // console.log(i)
      // console.log(resultDataObject.get(1649314800) + ' weatherford with hardcoded correct value')
      // console.log(resultDataObject.get(1649199600) + ' weatherford with i + delta value')
      // console.log(resultDataObject.get(i + delta))



      function findClosest(array, num) {
        return array.reduce(function(prev, curr) {
          return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
        });
      }

      let result;

      let result_i;

      // console.log(keysarray)
      if (keysarray === undefined || keysarray.length == 0) {
        result = (delta + i)
        result_i = i
    }
    else {
      result = findClosest(keysarray, (delta + i));
      result_i = findClosest(keysarray, (i));
    }

      //console.log(result + ' i + delta2')
      //console.log(resultDataObject.get(result) + ' i + delta3')

     //  console.log(resultDataObject.get(result) - resultDataObject.get(result_i) + ' final')
/*
      try {
        let accumulator = 0
        if (isNaN(resultDataObject.get(i + delta)) || isNaN(resultDataObject.get(i))) {
          continue
        }
        if (Math.abs(resultDataObject.get(i + delta)) < Math.abs(resultDataObject.get(i))) {
          continue
        }
        // If either reading is zero that indicates a missing reading -- do not report.
        if (resultDataObject.get(i + delta) === 0 || resultDataObject.get(i) === 0) {
          continue
        }
        accumulator = resultDataObject.get(i + delta) - resultDataObject.get(i)

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
      */
      

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
    //console.log(returnData)
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
    let delta = 1
    let dataDate = (new Date((payload.dateStart) * 1000))
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
        let monthDays = (new Date(dataDate.getFullYear(), dataDate.getMonth(), 0)).getDate()
        if (dataDate.getDate() > monthDays) monthDays = dataDate.getDate()
        delta = 60 * 60 * 24 * monthDays
        break
    }
    delta *= payload.dateInterval
    payload.dateStart = (payload.dateStart -  delta) - (payload.dateStart % 900)
  }
}
