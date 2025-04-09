/**
  Filename: avg_accumulated_real.js
  Description: Chart modifier for processing and formatting the baseline for
  accumulated data (e.g. accumulated_real) as kWh. This is displayed on each
  of the individual building campaign pages as a line chart.
*/

export default class LineAvgModifier {
  constructor () {
    this.dateStart = null
    this.dateEnd = null
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
    const {
      dateStart,
      dateEnd,
      intervalUnit,
      dateInterval
    } = payload
    const SECONDS_PER_DAY = 86400
    const baselineData = chartData.data
    const returnData = []
    const avgBins = Array.from({ length: 7 }, () => []) // one array per day of the week
    const differenceBaseline = new Map()
    let delta = 1

    // Determine delta based on interval unit
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
    }
    delta *= dateInterval

    // Calculate the difference between baseline data points
    for (let i = dateStart; i <= dateEnd; i += delta) {
      try {
        if (isNaN(baselineData.get(i + delta)) || isNaN(baselineData.get(i))) {
          continue
        }
        differenceBaseline.set(i + delta, baselineData.get(i + delta) - baselineData.get(i))
      } catch (error) {
        console.log(error)
      }
    }

    // Compute average baseline changes for each day-of-week
    const dateStartDay = new Date(dateStart * 1000).getDay()
    const binsPerDay = SECONDS_PER_DAY / delta
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // Calculate the first date that matches the day of the week
      const dayDifference = (dayOfWeek - dateStartDay + 7) % 7 // difference in days
      const firstMatchingDate = dateStart + dayDifference * SECONDS_PER_DAY

      // Calculate the average for each bin
      for (let timeBinIndex = 0; timeBinIndex < binsPerDay; timeBinIndex++) {
        let binStartDate = firstMatchingDate + (timeBinIndex * delta)
        let count = 0 // count of data points in this bin
        let sum = 0 // sum of data points in this bin
        while (binStartDate <= dateEnd) {
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

    // Compute the average for each bin
    for (let i = this.dateStart; i < this.dateEnd; i += delta) {
      try {
        const timestamp = new Date((delta + i) * 1000)
        const timeBinIndex = Math.floor(((i + delta) % (SECONDS_PER_DAY)) / delta)
        let baselinePoint = avgBins[timestamp.getDay()][timeBinIndex]
        returnData.push({ x: timestamp, y: baselinePoint })
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
      throw new Error('Time difference interval too large to work correctly')
    }
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

    this.dateStart = payload.dateStart
    this.dateEnd = payload.dateEnd
    payload.point = 'accumulated_real'
    payload.dateStart = payload.compareStart
    payload.dateEnd = payload.compareEnd
  }
}
