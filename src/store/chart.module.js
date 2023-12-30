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
    multStart: [],
    multEnd: [],
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
    // console.log(store.getters)

    // Reference: https://www.unixtimestamp.com/index.php
    // Reference: https://playcode.io/1457582
    let oct = 1697587199
    let nov = 1700265599
    // let dec = 1702857599

    // UPDATE (12/23/2023)

    // Need to update stuff below. Just changing the chart dates can now be done via
    // the Edit Menu UI, but need to update function for aligning the charts / shift charts left

    // Grab the default value. Building page URL = `http://localhost:8080/#/compare/["16","29"] > building 16 is default
    // Need a better way of doing this in future

    // As noted in edit_card.vue line 371 ish, the chart name will change after editing the timeframe via the edit card
    // web UI component. So we need a better way of distinguishing charts from each other, or rework how the rename
    // system works.

    /*
    if (store.getters.name === 'Total Electricity') {
      reqPayload.dateStart = nov
      reqPayload.dateEnd = dec
    } else {
      reqPayload.dateStart = oct
      reqPayload.dateEnd = nov
    }
    console.log(reqPayload)
    */
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
        // align new key with original datestart
        testmap.set(newkey - (nov - oct), data.get(newkey))
      }

      // comment out the 3 lines below to test experimental moving chart left
      // data = testmap
      // reqPayload.dateStart = oct - (nov - oct - (dec - nov)) // shift date start left to account for different month length
      // reqPayload.dateEnd = nov
    }

    console.log(data)

    let colorPayload = store.getters.color

    if (reqPayload.color) {
      colorPayload = reqPayload.color
    }

    let chartData = {
      label: store.getters.name,
      backgroundColor: colorPayload,
      borderColor: colorPayload,
      fill: false,
      showLine: true,
      spanGaps: false,
      data: data,
      multStart: store.getters.multStart,
      multEnd: store.getters.multEnd
    }

    await chartModifier.postGetData(chartData, reqPayload, this, store)

    console.log(chartData)

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
    console.log(payload)
    console.log(store.getters)
    if (
      payload.name === store.getters.name &&
      payload.point === store.getters.point &&
      payload.building === store.getters.building &&
      payload.meter === store.getters.meterGroupPath &&
      payload.multStart === store.getters.multStart &&
      payload.multEnd === store.getters.multEnd
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
    store.commit('multStart', payload.multStart)
    store.commit('multEnd', payload.multEnd)
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
  },

  // Function to convert plain text date format from Edit Form to Unix Timestamps
  // See similar dateStart / dateEnd mutation functions in block.module.js
  multStart (state, multStart) {
    for (let i in multStart) {
      if (typeof multStart[i] === 'string') {
        console.log('helloooo')
        state.multStart[i] = new Date(multStart[i]).getTime()
      } else if (typeof multStart[i] === 'number') {
        state.multStart[i] = multStart[i]
      } else if (multStart[i] instanceof Date) {
        state.multStart[i] = multStart[i].getTime()
      } else {
        throw new Error('Unrecognized format sent to multStart')
      }
    }
  },

  // Function to remove all elements from VueX state array and insert a placeholder value
  // You only need a mutation for this when you are dealing with global state (state.commit, this.store.getters, etc)
  resetMultStart (state, payload) {
    state.multStart = []
    state.multStart.push(...payload)
  },

  multEnd (state, multEnd) {
    for (let i in multEnd) {
      if (typeof multEnd[i] === 'string') {
        state.multEnd[i] = new Date(multEnd[i]).getTime()
      } else if (typeof multEnd[i] === 'number') {
        state.multEnd[i] = multEnd[i]
      } else if (multEnd[i] instanceof Date) {
        state.multEnd[i] = multEnd[i].getTime()
      } else {
        throw new Error('Unrecognized format sent to multEnd')
      }
    }
  },

  resetMultEnd (state, payload) {
    state.multEnd = []
    state.multEnd.push(...payload)
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

  multStart (state) {
    return state.multStart
  },

  multEnd (state) {
    return state.multEnd
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
