/*
  Filename: index.js
  Description: Contains function which returns objects containing settings
               for different ChartJS types.
*/

import LineAccumulatedReal from './line_bar/accumulated_real.js'
import LineBaselinePerc from './line_bar/baseline_perc.js'
import LineBaselineAvg from './line_bar/avg_accumulated_real.js'
import LineBase from './line_bar/base.js'
import LineEnergyChange from './line_bar/energy_change.js'

export default function (graphType, point) {
  if (graphType === 1 || graphType === 2) {
    // Line or Bar
    switch (point) {
      case 'accumulated_real':
        return new LineAccumulatedReal()
      case 'total':
        return new LineAccumulatedReal()
      case 'cubic_feet':
        return new LineAccumulatedReal()
      case 'baseline_percentage':
        return new LineBaselinePerc()
      case 'avg_accumulated_real':
        return new LineBaselineAvg()
      // TODO: add energy_change specific line chart
      case 'energy_change':
        return new LineEnergyChange()
      default:
        return new LineBase()
    }
  } else {
    throw new Error('Unknown chart type')
  }
}
