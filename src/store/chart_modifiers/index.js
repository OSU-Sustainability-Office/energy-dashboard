/*
  Filename: index.js
  Description: Contains function which returns objects containing settings
               for different ChartJS types.
*/

import LineAccumulatedReal from './line_bar/accumulated_real.js'
import LineBaselinePerc from './line_bar/baseline_perc.js'
import LineBaselineAvg from './line_bar/avg_accumulated_real.js'
import LineBase from './line_bar/base.js'
import LineTotalCurrent from './line_bar/current_total.js'
import LineTotalBaseline from './line_bar/baseline_total.js'
import LineTotalPercModifier from './line_bar/baseline_perc_total.js'

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
      case 'periodic_real_in':
        return new LineTotalCurrent()
      case 'periodic_real_out':
        return new LineTotalCurrent()
      case 'baseline_total':
        return new LineTotalBaseline()
      case 'baseline_perc_total':
        return new LineTotalPercModifier()
      default:
        return new LineBase()
    }
  } else {
    throw new Error('Unknown chart type')
  }
}
