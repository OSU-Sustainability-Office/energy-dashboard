/**
  Filename: min_max.js
  Description: Chart modifier that calculates the minimum or maximum
  value of a specified data point over a given time interval. Currently,
  only used for Acquisuite so it assumes 15 minute intervals.
*/

// Use intervalUnit and dateInterval to determine delta (time between data points)
// and monthDays (number of days in the current month) for the start date
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
  return [delta * dateInterval, monthDays]
}

export default class LineMinMaxModifier {
  // Calculate min/max values for the specified time interval
  async postGetData (chartData, payload, store, module) {
    const { dateStart, dateEnd, intervalUnit, dateInterval, point } = payload
    const SECONDS_PER_DAY = 86400
    const currentData = chartData.data
    const returnData = []
    const startDate = new Date(dateStart * 1000)
    const pointMap = {
      'real_power': 'Max',
      'reactive_power': 'Max',
      'apparent_power': 'Max',
      'real_a': 'Max',
      'real_b': 'Max',
      'real_c': 'Max',
      'reactive_a': 'Max',
      'reactive_b': 'Max',
      'reactive_c': 'Max',
      'cphase_a': 'Max',
      'cphase_b': 'Max',
      'cphase_c': 'Max',
      'apparent_a': 'Max',
      'apparent_b': 'Max',
      'apparent_c': 'Max',
      'input': 'Max',
      'maximum': 'Max',
      'instant': 'Max',
      'rate': 'Max',
      'pf_a': 'Min',
      'pf_b': 'Min',
      'pf_c': 'Min',
      'minimum': 'Min'
    }

    // Determine delta (time between data points)
    let [delta, monthDays] = getDelta(intervalUnit, startDate, dateInterval)

    let bestVal = 0
    let curDate = new Date((dateStart + delta) * 1000)
    let accumulatedTime = 0
    for (let i = dateStart; i <= dateEnd; i += 900) {
      // Reset accumulated time if it exceeds the delta
      if (accumulatedTime >= delta) {
        returnData.push({ x: curDate, y: bestVal })
        accumulatedTime = 0
        bestVal = 0

        // Adjust date for the next interval
        const oldDate = new Date(i * 1000)
        if (intervalUnit === 'month') {
          const monthDaysCurrent = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate()
          delta += (monthDaysCurrent - monthDays) * SECONDS_PER_DAY
          monthDays = monthDaysCurrent
        }
        curDate = new Date((i + delta) * 1000)
      }

      // Update current value if condition is met
      const curVal = currentData.get(i) || 0
      if (pointMap[point] === 'Max') {
        bestVal = Math.max(bestVal, Math.abs(curVal))
      } else if (pointMap[point] === 'Min') {
        bestVal = Math.min(bestVal, Math.abs(curVal))
      }

      // Update accumulated time
      accumulatedTime += 900
    }
    // Prevent scenarios where there is only one valid data point
    if (returnData.filter(o => !isNaN(o.y) && o.y > -1).length > 1) {
      chartData.data = returnData
    } else {
      // Shows "No Data" on the campaign buildings sidebar
      chartData.data = []
    }
  }

  async preGetData (payload, store, module) {
    let { intervalUnit, dateInterval } = payload
    const startDateObj = new Date(payload.dateStart * 1000)

    // Determine delta (time between data points)
    const delta = getDelta(intervalUnit, startDateObj, dateInterval)[0]

    // Adjust dateStart to align with data points in the database
    // Round down to 15 minute intervals
    payload.dateStart = payload.dateStart - delta - (payload.dateStart % 900)
  }
}
