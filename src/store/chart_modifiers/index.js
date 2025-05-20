/*
  Filename: chart_modifiers/index.js
  Description: Contains function which returns objects containing settings
               for different ChartJS types.
*/

import LineAccumulatedReal from './line_bar/accumulated_real.js'
import LineBaselinePerc from './line_bar/baseline_perc.js'
import LineBaselineAvg from './line_bar/avg_accumulated_real.js'
import LineDefault from './line_bar/default.js'
import LineTotalBaseline from './line_bar/baseline_total.js'
import LineTotalPercModifier from './line_bar/baseline_perc_total.js'
import LinePeriodicReal from './line_bar/periodic_real.js'
import LineMinMaxModifier from './line_bar/min_max.js'
import LineAverageModifier from './line_bar/average.js'

export default function (graphType, point) {
  if (graphType === 1 || graphType === 2) {
    // Line or Bar
    switch (point) {
      case 'accumulated_real': // Acquasuite
        return new LineAccumulatedReal()
      case 'total': // Acquasuite
        return new LineAccumulatedReal()
      case 'cubic_feet': // Acquasuite
        return new LineAccumulatedReal()
      case 'baseline_percentage': // Baseline Percentage for Acquasuite
        return new LineBaselinePerc()
      case 'avg_accumulated_real':
        return new LineBaselineAvg() // Baseline Average for Acquasuite
      case 'baseline_total':
        return new LineTotalBaseline() // Baseline Average for Pacific Power meters
      case 'baseline_perc_total':
        return new LineTotalPercModifier() // Baseline Percentage Total for Pacific Power meters
      case 'periodic_real_in':
        return new LinePeriodicReal() // Similar logic to Accumulated Real but supports Pacific Power meters
      case 'periodic_real_out':
        return new LinePeriodicReal() // Similar logic to Accumulated Real but supports Pacific Power meters
      case 'real_power':
        return new LineMinMaxModifier()
      case 'reactive_power':
        return new LineMinMaxModifier()
      case 'apparent_power':
        return new LineMinMaxModifier()
      case 'real_a':
        return new LineMinMaxModifier()
      case 'real_b':
        return new LineMinMaxModifier()
      case 'real_c':
        return new LineMinMaxModifier()
      case 'reactive_a':
        return new LineMinMaxModifier()
      case 'reactive_b':
        return new LineMinMaxModifier()
      case 'reactive_c':
        return new LineMinMaxModifier()
      case 'cphase_a':
        return new LineMinMaxModifier()
      case 'cphase_b':
        return new LineMinMaxModifier()
      case 'cphase_c':
        return new LineMinMaxModifier()
      case 'apparent_a':
        return new LineMinMaxModifier()
      case 'apparent_b':
        return new LineMinMaxModifier()
      case 'apparent_c':
        return new LineMinMaxModifier()
      case 'input':
        return new LineMinMaxModifier()
      case 'maximum':
        return new LineMinMaxModifier()
      case 'instant':
        return new LineMinMaxModifier()
      case 'rate':
        return new LineMinMaxModifier()
      case 'pf_a':
        return new LineMinMaxModifier()
      case 'pf_b':
        return new LineMinMaxModifier()
      case 'pf_c':
        return new LineMinMaxModifier()
      case 'minimum':
        return new LineMinMaxModifier()
      case 'vphase_ab':
        return new LineAverageModifier()
      case 'vphase_ac':
        return new LineAverageModifier()
      case 'vphase_bc':
        return new LineAverageModifier()
      case 'vphase_an':
        return new LineAverageModifier()
      case 'vphase_bn':
        return new LineAverageModifier()
      case 'vphase_cn':
        return new LineAverageModifier()
      default:
        console.error('Unknown point type for line/bar chart:', point)
        return new LineDefault()
    }
  } else {
    throw new Error('Unknown chart type')
  }
}
