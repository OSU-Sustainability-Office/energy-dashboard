/**
  Filename: average.js
  Description: Chart modifier that calculates the average value
  of a specified data point over a given time interval. Currently,
  only used for Acquisuite so it assumes 15 minute intervals.
*/

function getDeltaAndDaysInMonth (intervalUnit, startDate, dateInterval) {
  let delta = 1
  let daysInMonth = 1
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
      daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
      delta = 86400 * daysInMonth
      break
  }
  return [delta * dateInterval, daysInMonth]
}

export default class LineAverageModifier {
  async postGetData (chartData, payload, store, module) {
    const { dateStart, dateEnd, intervalUnit, dateInterval } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const startDate = new Date(dateStart * 1000)
    let [delta, curDaysInMonth] = getDeltaAndDaysInMonth(intervalUnit, startDate, dateInterval)

    let accumulatedVal = 0
    let curDate = new Date((dateStart + delta) * 1000)
    let accumulatedTime = 0
    for (let i = dateStart; i <= dateEnd; i += 900) {
      // Reset accumulated time and push results when the interval is reached
      if (accumulatedTime >= delta) {
        returnData.push({ x: curDate, y: accumulatedVal / (accumulatedTime / 900) })
        accumulatedTime = 0
        accumulatedVal = 0

        // Adjust date for the next interval
        const oldDate = new Date(i * 1000)
        if (intervalUnit === 'month') {
          const updatedDaysInMonth = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate()
          delta += (updatedDaysInMonth - curDaysInMonth) * SECONDS_PER_DAY
          curDaysInMonth = updatedDaysInMonth
        }
        curDate = new Date((i + delta) * 1000)
      }

      // Update accumulated variables
      const curVal = currentData.get(i) || 0
      accumulatedVal += curVal
      accumulatedTime += 900
    }

    // Prevent scenarios where there is only one valid data point
    if (returnData.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = returnData
    } else {
      chartData.data = []
    }
  }

  // Before requesting data, align the start date with the database
  async preGetData (payload, store, module) {
    let { intervalUnit, dateInterval } = payload
    const startDateObj = new Date(payload.dateStart * 1000)
    const delta = getDeltaAndDaysInMonth(intervalUnit, startDateObj, dateInterval)[0]

    // Adjust dateStart to align with data points in the database
    // Round down to 15 minute intervals
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
