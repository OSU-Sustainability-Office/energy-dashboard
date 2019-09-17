/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'

const state = () => {
  return {
    name: null,               // String
    point: null,              // String (See metering points)
    building: null,           // String buildingId
    id: null,                 // Integer DB ID
    meterGroupPath: null,
    path: null,
    color: '#000000'
  }
}

const actions = {

  async getData (store, payload) {
    payload['point'] = store.getters.point
    let data = await this.dispatch(store.getters.meterGroupPath + '/getData', payload)
    return {
      label: store.getters.name,
      backgroundColor: store.getters.color,
      borderColor: store.getters.color,
      fill: false,
      showLine: true,
      spanGaps: false,
      data: data
    }
  },

  async changeChart (store, id) {
    let chart = API.chart(id)
    store.commit('promise', chart)
    store.commit('id', id)
    await chart
    store.commit('name', chart.name)
    store.commit('point', chart.point)
    store.commit('building', chart.building)
    store.commit('meterGroupPath', this.getters.meterGroup(chart.meterGroup).path)
  }

}

const mutations = {
  path (state, path) {
    state.path = path
  },

  color (state, color) {
    state.color = color
  },

  name (state, name) {
    state.name = name
  },

  point (state, point) {
    state.point = point
  },

  building (state, building) {
    state.building = building
  },

  id (state, id) {
    state.id = id
  },

  meterGroupPath (state, meterGroupPath) {
    state.meterGroupPath = meterGroupPath
  },

  promise (state, promise) {
    state.promise = promise
  }

}

const getters = {
  promise (state) {
    return state.promise
  },

  color (state) {
    return state.color
  },

  path (state) {
    return state.path
  },

  name (state) {
    return state.name
  },

  point (state) {
    return state.point
  },

  building (state) {
    return state.building
  },

  id (state) {
    return state.id
  },

  meterGroupPath (state) {
    return state.meterGroupPath
  },

  pointString (state) {
    if (state.point) {
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
        input: 'Steam Input',
        apparent_a: 'Apparent Power, Phase A (VA)',
        apparent_b: 'Apparent Power, Phase B (VA)',
        apparent_c: 'Apparent Power, Phase C (VA)',
        baseline_percentage: 'Percentage (%)'
      }
      return map[state.point]
    } else {
      return ' '
    }
  },

  unitString (state) {
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
      apparent_c: 'VA',
      baseline_percentage: '%'
    }
    return map[state.point]
  }
}

const modules = {
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
