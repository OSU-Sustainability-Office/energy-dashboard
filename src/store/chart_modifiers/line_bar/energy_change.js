/*
  filename: energy_change.js
  description: chart preset for "energy in interval" data collected from solar array
               like devices.  For these types of metrics most visualization software
               won't just grab the data points every nth interval but rather add all
               the meter readings between the nth and (n+1)th reading.

               Basically if we had four points between 12pm and 1pm
               204kwh,   403kwh,   105kwh,  235kwh
               12:00,    12:15,    12:30,    12:45

               Rather than just display 235kwh for 12:00pm, we would display
               (204+403+105+235) = 947kwh for 12:00pm.

               Or at least that's how Tesla Solar City appears to calculate data.
*/

export default class LineEnergyChange {
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
          timezoneOffset*: timezone of initial timestamp (optional)
        }
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    let resultDataObject = chartData.data
    let returnData = []
    let delta = 1
    let result
    let result_i

    // Finds the nearest valid keys for a given building. In this case, it handles solar meters that upload less than every 15 minutes.
    function findClosest (array, num) {
      return array.reduce(function (prev, curr) {
        return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev)
      })
    }

    const intervalUnitDelta = {
      'minute': 60,
      'hour': 3600,
      'day': 86400
    }

    delta = intervalUnitDelta[payload.intervalUnit]
    delta *= payload.dateInterval

    // set the offset if there is one we need to account forre
    const offset = (payload.timeZoneOffset) ? payload.timeZoneOffset : 0
    let keysarray = Array.from(resultDataObject.keys())

    for (let i = payload.dateStart; i <= payload.dateEnd; i += delta) {
      result = findClosest(keysarray, (delta + i))
      result_i = findClosest(keysarray, (i))
      console.log(result + ' result')
      console.log(result_i + ' result_i')

      try {
        console.log(resultDataObject.get(result) + ' resultDataObject.get(result)')
        console.log(resultDataObject.get(result_i) + ' resultDataObject.get(result_i)')

        let accumulator = 0
        if (isNaN(resultDataObject.get(result)) || isNaN(resultDataObject.get(result_i))) {
          continue
        }
        accumulator = resultDataObject.get(result)
        // Add proceeding values
        const minimumInterval = intervalUnitDelta['minute'] * payload.dateInterval
        for (let next = minimumInterval; next < delta; next += minimumInterval) {
          const nextReading = resultDataObject.get(result_i + (delta + next))
          accumulator =  (isNaN(nextReading)) ? accumulator : accumulator + nextReading
        }
        // console.log(accumulator)

        returnData.push({ x: (new Date((result + offset) * 1000)), y: accumulator })
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
  }
}
