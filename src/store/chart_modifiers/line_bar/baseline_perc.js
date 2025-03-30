/**
  Filename: baseline_perc.js
  Description: Chart modifier for displaying the baseline percentage
  values from the chart module for accumulated data (e.g. accumulated_real).
*/

export default class LinePercModifier {
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
    const {
      dateStart,
      dateEnd,
      compareStart,
      compareEnd,
      intervalUnit,
      dateInterval,
      baselineData
    } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const avgBins = Array.from({ length: 7 }, () => []) // one array per day of the week
    const differenceBaseline = new Map() // keys are epoch time in seconds, values are difference between baseline data points
    let delta = 1

    // determine delta based on interval unit
    switch (intervalUnit) {
      case 'minute':
        delta = 60 // seconds in a minute
        break
      case 'hour':
        delta = 3600 // seconds in an hour
        break
      case 'day':
        delta = SECONDS_PER_DAY
        break
    }
    delta *= dateInterval

    // calculate the difference between baseline data points
    for (let i = compareStart; i <= compareEnd; i += delta) {
      try {
        const baselineTimestamp = i + delta
        if (isNaN(baselineData.get(baselineTimestamp)) || isNaN(baselineData.get(i))) {
          continue
        }
        differenceBaseline.set(baselineTimestamp, baselineData.get(baselineTimestamp) - baselineData.get(i))
      } catch (error) {
        console.log(error)
      }
    }

    // also don't know if we need findClosest() function calls for the two for loops below, for "past 6 hours" or "past day". Need better training data maybe (adjust end date on test campaign)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // align start date with the day of the week
      let startDate = compareStart
      while (new Date(startDate * 1000).getDay() !== dayOfWeek) {
        startDate += SECONDS_PER_DAY // add one day
      }

      // calculate the average for each bin
      const binsPerDay = SECONDS_PER_DAY / delta
      for (let timeBinIndex = 0; timeBinIndex < binsPerDay; timeBinIndex++) {
        let binStartDate = startDate + timeBinIndex * delta
        let count = 0 // count of data points in this bin
        let sum = 0 // sum of data points in this bin

        while (binStartDate <= compareEnd) {
          try {
            if (!isNaN(differenceBaseline.get(binStartDate))) {
              count++
              sum += differenceBaseline.get(binStartDate)
            }
          } catch (error) {
            console.log(error)
          }
          binStartDate += SECONDS_PER_DAY * 7 // add one week
        }

        // divide the sum by the count to get the average
        const avg = count > 0 ? sum / count : -1 // -1 indicates no data points in this bin
        avgBins[dayOfWeek].push(avg)
      }
    }

    // loop through all available data points and calculate the percentage difference
    for (let i = dateStart; i <= dateEnd; i += delta) {
      try {
        if (isNaN(currentData.get(delta + i)) || isNaN(currentData.get(i))) {
          continue
        }
        const timestamp = new Date((delta + i) * 1000)
        const timeBinIndex = Math.floor(((delta + i) % (SECONDS_PER_DAY)) / delta)
        const baselineChange = avgBins[timestamp.getDay()][timeBinIndex]
        if (baselineChange !== -1 && baselineChange !== 0) {
          const currentChange = currentData.get(delta + i) - currentData.get(i)
          const changeRatio = currentChange / baselineChange // ratio of current change to baseline change
          const percentDifference = (changeRatio * 100) - 100 // percentage difference from baseline

          // do not add data point to graph if datapoint is -100% (issue with Weatherford for campaign 8, near the end)
          if (percentDifference !== -100) {
            returnData.push({ x: timestamp, y: percentDifference })
          }
        }
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
    const baselineData = await store.dispatch(meterGroupPath + '/getData', baselinePayload)
    payload['baselineData'] = baselineData
  }
}
