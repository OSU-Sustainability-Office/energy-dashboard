/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:36:17-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
<<<<<<< HEAD
 * @Last modified time: 2019-01-04T12:35:45-08:00
=======
 * @Last modified time: 2018-12-20T16:04:12-08:00
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
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
<<<<<<< HEAD
  mapPoint: () => point => {
=======
  mapPoint: state => point => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
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
<<<<<<< HEAD
      input: 'Steam Input',
      apparent_a: 'Apparent Power, Phase A (VA)',
      apparent_b: 'Apparent Power, Phase B (VA)',
      apparent_c: 'Apparent Power, Phase C (VA)'
    }

    return map[point]
  },
  mapPointUnit: () => point => {
    const map = {
      accumulated_real: 'kWh',
      real_power: 'W',
      reactive_power: 'VAR',
      apparent_power: 'VA',
      real_a: 'kW',
      real_b: 'kW',
      real_c: 'kW',
      reactive_a: 'kVAR',
      reactive_b: 'kVAR',
      reactive_c: 'kVAR',
      pf_a: 'kVAR',
      pf_b: '',
      pf_c: '',
      vphase_ab: 'V',
      vphase_bc: 'V',
      vphase_ac: 'V',
      vphase_an: 'V',
      vphase_bn: 'V',
      vphase_cn: 'V',
      cphase_a: 'A',
      cphase_b: 'A',
      cphase_c: 'A',
      cubic_feet: 'CF',
      maximum: '',
      minimum: '',
      rate: 'CFm',
      total: 'Lbs',
      input: '',
      apparent_a: 'VA',
      apparent_b: 'VA',
      apparent_c: 'VA'
=======
      input: 'Steam Input'
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    }

    return map[point]
  }
}
