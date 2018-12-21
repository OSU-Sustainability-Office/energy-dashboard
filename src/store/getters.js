/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:36:17-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-20T16:04:12-08:00
 */
export default {
  story: state => {
    return state.currentStory
  },
  user: state => {
    return state.user
  },
  stories: state => {
    return state.stories
  },
  block: state => index => {
    return state.currentStory.blocks[index]
  },
  chart: state => (blockIndex, chartIndex) => {
    return state.currentStory.blocks[blockIndex].charts[chartIndex]
  },
  data: state => (blockIndex, chartIndex) => {
    return state.currentStory.blocks[blockIndex].charts[chartIndex].data
  },
  // COMMON FUNCTIONS
  mapPoint: state => point => {
    const map = {
      accumulated_real: 'Net Energy Usage (kWh)',
      real_power: 'Real Power (W)',
      reactive_power: 'Reactive Power (VAR)',
      apparent_power: 'Apparent Power (VA)',
      real_a: 'Real Power, Phase A (kW)',
      real_b: 'Real Power, Phase B (kW)',
      real_c: 'Real Power, Phase C (kW)',
      reactive_a: 'Reactive Power, Phase A (kVAR)',
      reactive_b: 'Reactive Power, Phase B (kVAR)',
      reactive_c: 'Reactive Power, Phase C (kVAR)',
      pf_a: 'Power Factor, Phase A',
      pf_b: 'Power Factor, Phase B',
      pf_c: 'Power Factor, Phase C',
      vphase_ab: 'Voltage, Phase A-B (V)',
      vphase_bc: 'Voltage, Phase B-C (V)',
      vphase_ac: 'Voltage, Phase A-C (V)',
      vphase_an: 'Voltage, Phase A-N (V)',
      vphase_bn: 'Voltage, Phase B-N (V)',
      vphase_cn: 'Voltage, Phase C-N (V)',
      cphase_a: 'Current, Phase A (A)',
      cphase_b: 'Current, Phase B (A)',
      cphase_c: 'Current, Phase C (A)',
      cubic_feet: 'Total Natural Gas (CF)',
      maximum: 'Maximum',
      minimum: 'Minimum',
      rate: 'Natural Gas Rate (CFm)',
      total: 'Steam (Lbs)',
      input: 'Steam Input'
    }

    return map[point]
  }
}
