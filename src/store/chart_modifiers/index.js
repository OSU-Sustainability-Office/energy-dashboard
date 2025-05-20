/*
  Filename: chart_modifiers/index.js
  Description: Contains function which returns objects containing settings
               for different ChartJS types.
*/

import AccumulatedReal from './accumulated_real.js'
import Default from './default.js'
import PeriodicReal from './periodic_real.js'
import MinMaxModifier from './min_max.js'
import AverageModifier from './average.js'
import BaselineAccumulatedReal from './campaign_charts/baseline_accumulated_real.js'
import BaselinePeriodicReal from './campaign_charts/baseline_periodic_real.js'

export default function (graphType, point) {
  // 1 = Line, 2 = bar
  if (graphType === 1 || graphType === 2) {
    switch (point) {
      case 'accumulated_real':
      case 'total':
      case 'cubic_feet':
        return new AccumulatedReal()

      case 'periodic_real_in':
      case 'periodic_real_out':
        return new PeriodicReal()

      case 'real_power':
      case 'reactive_power':
      case 'apparent_power':
      case 'real_a':
      case 'real_b':
      case 'real_c':
      case 'reactive_a':
      case 'reactive_b':
      case 'reactive_c':
      case 'cphase_a':
      case 'cphase_b':
      case 'cphase_c':
      case 'apparent_a':
      case 'apparent_b':
      case 'apparent_c':
      case 'input':
      case 'maximum':
      case 'instant':
      case 'rate':
      case 'pf_a':
      case 'pf_b':
      case 'pf_c':
      case 'minimum':
        return new MinMaxModifier()

      case 'vphase_ab':
      case 'vphase_ac':
      case 'vphase_bc':
      case 'vphase_an':
      case 'vphase_bn':
      case 'vphase_cn':
        return new AverageModifier()

      // Campaign charts
      case 'baseline_percentage':
      case 'avg_accumulated_real':
        return new BaselineAccumulatedReal()

      case 'baseline_total':
      case 'baseline_perc_total':
        return new BaselinePeriodicReal()

      // Fallback for unknown point types
      default:
        console.error('Unknown point type for line/bar chart:', point)
        return new Default()
    }
  } else {
    throw new Error('Unknown chart type')
  }
}
