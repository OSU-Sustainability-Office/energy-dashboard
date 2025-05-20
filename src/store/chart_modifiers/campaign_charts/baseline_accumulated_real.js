/**
  Filename: baseline_accumulated_real.js
  Description: Percentage difference is displayed on main campaign page with all
  of the buildings as a line chart. Baseline point is displayed on the
  individual building page line chart.
*/

// Returns delta (time between data points) in seconds
function getDelta (intervalUnit, startDate, dateInterval) {
  let delta = 1
  let monthDays = 1
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
      monthDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
      delta = 86400 * monthDays
      break
  }
  return delta * dateInterval
}

// Returns the average data for each day of the week
function getBaselineData (compareStart, compareEnd, delta, differenceBaseline) {
  const SECONDS_PER_DAY = 86400
  const avgBins = Array.from({ length: 7 }, () => []) // one array per day of the week
  const compareStartDay = new Date(compareStart * 1000).getDay()
  const binsPerDay = SECONDS_PER_DAY / delta

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    // Calculate the first date that matches the day of the week
    const dayDifference = (dayOfWeek - compareStartDay + 7) % 7 // difference in days
    const firstMatchingDate = compareStart + dayDifference * SECONDS_PER_DAY

    // Calculate the average for each bin
    for (let timeBinIndex = 0; timeBinIndex < binsPerDay; timeBinIndex++) {
      let binStartDate = firstMatchingDate + timeBinIndex * delta
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

      // Divide the sum by the count to get the average
      const avg = count > 0 ? sum / count : -1 // -1 indicates no data points in this bin
      avgBins[dayOfWeek].push(avg)
    }
  }

  return avgBins
}

export default class BaselineAccumulatedReal {
  constructor () {
    this.point = null
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: chartData is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async postGetData (chartData, payload, store, module) {
    const { dateStart, dateEnd, compareStart, compareEnd, intervalUnit, dateInterval, baselineData } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const differenceBaseline = new Map()
    const delta = getDelta(intervalUnit, dateStart, dateInterval)

    // Calculate the difference between baseline data points
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

    // Use the baseline data to calculate averages for each day of the week
    const avgBins = getBaselineData(compareStart, compareEnd, delta, differenceBaseline)

    // Push either the percentage difference or the baseline point to the returnData array
    for (let i = dateStart; i <= dateEnd; i += delta) {
      try {
        if (isNaN(currentData.get(delta + i)) || isNaN(currentData.get(i))) {
          continue
        }
        const timestamp = new Date((delta + i) * 1000)
        const timeBinIndex = Math.floor(((delta + i) % SECONDS_PER_DAY) / delta) // gets time slot within the day
        const baselinePoint = avgBins[timestamp.getDay()][timeBinIndex]
        if (baselinePoint !== -1 && baselinePoint !== 0) {
          const currentPoint = currentData.get(delta + i) - currentData.get(i)
          const changeRatio = currentPoint / baselinePoint // ratio of current point to baseline point
          const percentDifference = changeRatio * 100 - 100 // percentage difference from baseline

          // do not add data point to graph if datapoint is -100% (issue with Weatherford for campaign 8, near the end)
          if (percentDifference !== -100 && this.point === 'baseline_percentage') {
            returnData.push({ x: timestamp, y: percentDifference })
          } else if (this.point === 'avg_accumulated_real') {
            returnData.push({ x: timestamp, y: baselinePoint })
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    // Prevent corrupted data from getting returned
    if (returnData.filter(o => !isNaN(o.y) && o.y > -1).length > 0) {
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
      - store (vuex store)
      - module: (vuex module) module dispatching this function call

    Returns: Nothing (Note: payload is passed by reference so editiing this argument will change it in the chart update sequence)
  */
  async preGetData (payload, store, module) {
    if (payload.intervalUnit === 'day' && payload.dateInterval > 1) {
      throw new Error('Time difference interval to large to work correctly')
    }
    // Set the dateStart to the start of the interval
    const delta = getDelta(payload.intervalUnit, payload.dateStart, payload.dateInterval)
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
    this.point = payload.point

    // Fetch baseline data
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
