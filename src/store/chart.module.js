/**
  Filename: chart.module.js
  Info: Module representing a chart with the parameters needed for visualizing the meter data
*/
import API from './api.js'
import ChartModifiers from './chart_modifiers/index.js'

const state = () => {
  return {
    name: null, // String
    point: null, // String (See metering points)
    building: null, // String buildingId
    id: null, // Integer DB ID
    meterGroupPath: null,
    path: null,
    color: '#000000',
    promise: null,
    modifierData: {}
  }
}

const actions = {
  // Example Payload
  // {
  //   "dateStart": 1590512400,
  //   "dateEnd": 1595696400,
  //   "intervalUnit": "day",
  //   "dateInterval": 1,
  //   "graphType": 1
  // }
  async getData (store, payload) {
    if (!store.getters.meterGroupPath) return
    const reqPayload = {
      point: store.getters.point,
      ...payload,
      ...store.getters.modifierData
    }
    console.log(store.getters.name)

    // Reference: https://www.unixtimestamp.com/index.php
    // Reference: https://playcode.io/1457582
    let oct = 1697587199
    let nov = 1700265599
    let dec = 1702857599

    // Grab the default value. Building page URL = `http://localhost:8080/#/compare/["16","29"] > building 16 is default
    // Need a better way of doing this in future
    if (store.getters.name === 'Total Electricity') {
      reqPayload.dateStart = nov
      reqPayload.dateEnd = dec
    } else {
      reqPayload.dateStart = oct
      reqPayload.dateEnd = nov
    }
    console.log(reqPayload)

    const chartModifier = ChartModifiers(payload.graphType, reqPayload.point)
    await chartModifier.preGetData(reqPayload, this, store)

    // This is the only API call you need for the data (avoid chart going to zero after shifting left).
    // I just forgot to set the dateEnd for both scenarios earlier
    let data = await this.dispatch(store.getters.meterGroupPath + '/getData', reqPayload)

    if (store.getters.name === 'Total Electricity') {
      // console.log( data )
      let testmap = new Map()
      for (let newkey of data.keys()) {
        // console.log(newkey)

        // align new key with original datestart
        testmap.set(newkey - (nov - oct), data.get(newkey))
      }
      console.log(testmap)

      // comment out the 3 lines below to test experimental moving chart left
      // data = testmap
      // reqPayload.dateStart = oct
      // reqPayload.dateEnd = nov
    }
    let chartData = {
      label: store.getters.name,
      backgroundColor: store.getters.color,
      borderColor: store.getters.color,
      fill: false,
      showLine: true,
      spanGaps: false,
      data: data
    }

    await chartModifier.postGetData(chartData, reqPayload, this, store)

    return chartData
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
  },

  async update (store, payload) {
    if (
      payload.name === store.getters.name &&
      payload.point === store.getters.point &&
      payload.building === store.getters.building &&
      payload.meter === store.getters.meterGroupPath
    ) {
      return
    }
    let viewPath = store.getters.path.split('/')
    viewPath.pop()
    viewPath.pop()
    viewPath = viewPath.join('/')
    let viewUser = this.getters[viewPath + '/user']
    if (viewUser && viewUser === this.getters['user/onid']) {
      await API.chart(
        {
          id: store.getters.id,
          name: payload.name,
          point: payload.point,
          meterGroup: this.getters[payload.meter + '/id'],
          building: this.getters[payload.building + '/id']
        },
        'put'
      )
    }
    store.commit('name', payload.name)
    store.commit('point', payload.point)
    store.commit('building', payload.building)
    store.commit('meterGroupPath', payload.meter)
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },

  modifierData (state, data) {
    state.modifierData = data
  },

  promise (state, promise) {
    state.promise = promise
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
    // example call triggered from block.module.js's updateCharts()
    // commented out for now as this triggers many times
    // console.log(building)
    state.building = building
  },

  id (state, id) {
    state.id = id
  },

  meterGroupPath (state, meterGroupPath) {
    state.meterGroupPath = meterGroupPath
  }
}

const getters = {
  promise (state) {
    return state.promise
  },

  modifierData (state) {
    return state.modifierData
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
        baseline_percentage: 'Percentage (%)',
        total_energy: 'Lifetime Cumulative Energy (kWh)',
        energy_change: 'Energy In Interval (kWh)',
        voltage: 'Voltage (V)',
        current: 'Current (A)'
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
      baseline_percentage: '%',
      total_energy: 'kWh',
      energy_change: 'kWh',
      voltage: 'V',
      current: 'A'
    }
    return map[state.point]
  }
}

const modules = {}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
