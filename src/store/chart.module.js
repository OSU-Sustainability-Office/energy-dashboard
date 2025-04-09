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

  // see getData function in src\store\block.module.js for potential changes to the input payload's multStart, multEnd, color

  async getData (store, payload) {
    if (!store.getters.meterGroupPath) return
    const reqPayload = {
      point: store.getters.point,
      ...payload,
      ...store.getters.modifierData
    }

    let point = reqPayload.point

    const chartModifier = ChartModifiers(payload.graphType, point)
    await chartModifier.preGetData(reqPayload, this, store)

    let data = await this.dispatch(store.getters.meterGroupPath + '/getData', reqPayload)

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

    // fix LINC meter being off by factor of 10
    // TODO: look into fixing data as it goes into the database instead of here
    // See this issue for more info: https://github.com/OSU-Sustainability-Office/energy-dashboard/issues/341
    if (store.getters.meterGroupPath.split('_')[2] === '199' && store.getters.point === 'accumulated_real') {
      chartData.data.map(d => {
        d.y = d.y * 10
      })
    }

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
    state.multStart = []
    for (let i in multStart) {
      if (typeof multStart[i] === 'string') {
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

  multEnd (state, multEnd) {
    state.multEnd = []
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

  resetMultTimeStamps (state) {
    state.multStart = []
    state.multEnd = []
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
        real_power: 'Real Power (kW)',
        reactive_power: 'Reactive Power (kVAR)',
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
        instant: 'Instant',
        maximum: 'Maximum',
        minimum: 'Minimum',
        rate: 'Natural Gas Rate (CFm)',
        total: 'Steam (Lbs)',
        input: 'Steam Input',
        apparent_a: 'Apparent Power, Phase A (VA)',
        apparent_b: 'Apparent Power, Phase B (VA)',
        apparent_c: 'Apparent Power, Phase C (VA)',
        baseline_percentage: 'Percentage (%)',
        baseline_perc_total: 'Percentage (%)',
        periodic_real_in: 'Net Energy Usage (kWh)',
        periodic_real_out: 'Energy Produced (kWh)'
      }
      return map[state.point]
    } else {
      return ' '
    }
  },

  unitString (state) {
    const map = {
      accumulated_real: 'kWh',
      real_power: 'kW',
      reactive_power: 'kVAR',
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
      instant: '',
      maximum: '',
      minimum: '',
      rate: 'CFm',
      total: 'Lbs',
      input: '',
      apparent_a: 'VA',
      apparent_b: 'VA',
      apparent_c: 'VA',
      baseline_percentage: '%',
      baseline_perc_total: '%',
      periodic_real_in: 'kWh',
      periodic_real_out: 'kWh'
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
