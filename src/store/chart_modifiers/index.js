/*
 * @Author: you@you.you
 * @Date:   Wednesday March 25th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday March 25th 2020
 * @Copyright:  (c) Oregon State University 2020
 */

import LineAccumulatedReal from './line_bar/accumulated_real.js'
import LineBaselinePerc from './line_bar/baseline_perc.js'
import LineBase from './line_bar/base.js'
import PieBase from './pie_doughnut/base.js'

export default function (graphType, point) {
  if (graphType === 3 || graphType === 4) { // Pie or Doughnut
    switch (point) {
      default:
        return new PieBase()
    }
  } else if (graphType === 1 || graphType === 2) { // Line or Bar
    switch (point) {
      case 'accumulated_real':
        return new LineAccumulatedReal()
      case 'total':
        return new LineAccumulatedReal()
      case 'cubic_feet':
        return new LineAccumulatedReal()
      case 'baseline_percentage':
        return new LineBaselinePerc()
      default:
        return new LineBase()
    }
  } else {
    throw new Error('Unknown chart type')
  }
}
