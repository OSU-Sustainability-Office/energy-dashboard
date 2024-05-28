/*
 * Filename: block.module.js
 * Description: Vuex module for handling "blocks" the abstract container for
 *              handling meter data and their visual properties (interacts with chart module).
 */
import API from './api.js'
import Chart from './chart.module.js'
import BlockModifiers from './block_modifiers/index.js'

const state = () => {
  return {
    modifiers: [],
    path: null,
    promise: null,
    name: null, // String
    dateInterval: null, // Int
    intervalUnit: null, // String (minute, hour, day)
    graphType: null, // Int (1: Line, 2: Bar, 3: Doughnut, 4: Piechart, 5: LineBar)
    dateStart: null, // Epoch time
    dateEnd: null, // Epoch time
    id: null, // Integer DB ID
    chartColors: ['#4A773C', '#00859B', '#FFB500', '#AA9D2E', '#D3832B', '#0D5257', '#7A6855', '#C4D6A4'],
    timeZoneOffset: null
  }
}

const actions = {
  loadChart (store, id) {
    let chartSpace = 'chart_' + id.toString()
    let moduleSpace = store.getters.path + '/' + chartSpace
    this.registerModule(moduleSpace.split('/'), Chart)
    store.commit(chartSpace + '/path', moduleSpace)
    store.commit(
      chartSpace + '/color',
      store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length]
    )
    store.dispatch(chartSpace + '/changeChart', id)
  },

  async addModifier (store, modifierName) {
    const currentModNames = store.getters.modifiers.map(o => o.name)

    if (currentModNames.indexOf(modifierName) < 0) {
      const ModClass = BlockModifiers[modifierName]
      if (!ModClass) {
        throw new Error('Modifier not found')
      }
      const newMod = new ModClass(this, store)
      await newMod.onAdd(this, store)
      store.commit('addMod', newMod)
    } else {
      throw new Error('Modifier already exists on block')
    }
  },

  async removeModifier (store, modifierName) {
    const currentModNames = store.getters.modifiers.map(o => o.name)
    const modIndex = currentModNames.indexOf(modifierName)
    if (modIndex < 0) {
      throw new Error('Modifier not found on block')
    } else {
      const removingMod = store.getters.modifiers[modIndex]
      await removingMod.onRemove(this, store)
      store.commit('removeMod', removingMod)
    }
  },

  async resetDefault (store) {
    await store.dispatch('removeAllModifiers')
  },

  async removeAllModifiers (store) {
    for (let modIndex in store.getters.modifiers) {
      if (modIndex < 0) {
        throw new Error('Modifier not found on block')
      } else {
        const removingMod = store.getters.modifiers[modIndex]
        await removingMod.onRemove(this, store)
        store.commit('removeMod', removingMod)
      }
    }
  },

  async updateModifier (store, payload) {
    // eslint-disable-next-line no-proto
    const currentModNames = store.getters.modifiers.map(o => o.__proto__.constructor.name)
    const modIndex = currentModNames.indexOf(payload.name)
    if (modIndex < 0) {
      throw new Error('Modifier not found on block')
    } else {
      const updatingMod = store.getters.modifiers[modIndex]
      await updatingMod.updateData(this, store, payload.data)
    }
  },

  async unloadChart (store, chartId) {
    let chart = store.getters.chart(chartId)
    this.unregisterModule(chart.path.split('/'))
  },

  async loadCharts (store, charts) {
    for (let chart of charts) {
      let chartSpace = 'chart_' + chart.id
      let moduleSpace = store.getters.path + '/' + chartSpace
      this.registerModule(moduleSpace.split('/'), Chart)
      store.commit(chartSpace + '/path', moduleSpace)

      store.commit(chartSpace + '/name', chart.name)
      store.commit(chartSpace + '/point', chart.point)
      store.commit(chartSpace + '/id', chart.id)
      store.commit(
        chartSpace + '/color',
        store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length]
      )
      await this.getters['map/promise']
      await this.getters['map/allBuildingPromise']
      store.commit(chartSpace + '/building', this.getters['map/meterGroup'](chart.meters).building)
      store.commit(chartSpace + '/meterGroupPath', this.getters['map/meterGroup'](chart.meters).path)
      store.commit(chartSpace + '/promise', Promise.resolve())
    }
  },

  async update (store, payload) {
    if (
      payload.name === store.getters.name &&
      payload.dateInterval === store.getters.dateInterval &&
      payload.intervalUnit === store.getters.intervalUnit &&
      payload.graphType === store.getters.graphType &&
      payload.dateStart === store.getters.dateStart &&
      payload.dateEnd === store.getters.dateEnd
    ) {
      return
    }
    let viewPath = store.getters.path.split('/')
    viewPath.pop()
    viewPath = viewPath.join('/')
    let user = this.getters[viewPath + '/user']

    store.commit('name', payload.name)
    store.commit('dateInterval', payload.dateInterval)
    store.commit('intervalUnit', payload.intervalUnit)
    store.commit('graphType', payload.graphType)
    store.commit('dateStart', payload.dateStart)
    store.commit('dateEnd', payload.dateEnd)
    if (user && user === this.getters['user/onid']) {
      payload.id = store.getters.id
      payload.dateStart = new Date(store.getters.dateStart).toISOString()
      payload.dateEnd = new Date(store.getters.dateEnd).toISOString()
      await API.block(payload, 'put')
    }
  },

  async changeBlock (store, id) {
    store.commit('shuffleChartColors')
    for (let chart of store.getters.charts) {
      this.unregisterModule(chart.path.split('/'))
    }
    store.commit('id', id)
    let block = API.block(id)
    store.commit('promise', block)
    block = await block
    store.commit('name', block.name)
    store.commit('dateInterval', block.dateInterval)
    store.commit('intervalUnit', block.intervalUnit)
    store.commit('graphType', block.graphType)
    store.commit('dateStart', block.dateStart)
    store.commit('dateEnd', block.dateEnd)

    for (let chart of block.charts) {
      store.dispatch('loadChart', chart)
    }
  },

  async newChart (store, payload) {
    let id = (
      await API.chart(
        {
          name: payload.name,
          point: payload.point,
          meterGroup: this.getters[payload.meter + '/id'],
          building: this.getters[payload.building + '/id'],
          blockId: store.getters.id
        },
        'post'
      )
    ).id
    let chartSpace = 'chart_' + id
    let moduleSpace = store.getters.path + '/' + chartSpace
    await this.registerModule(moduleSpace.split('/'), Chart)
    store.commit(chartSpace + '/path', moduleSpace)
    store.commit(
      chartSpace + '/color',
      store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length]
    )
    store.commit(chartSpace + '/name', payload.name)
    store.commit(chartSpace + '/building', payload.building)
    store.commit(chartSpace + '/point', payload.point)
    store.commit(chartSpace + '/meterGroupPath', payload.meter)
  },

  async removeChart (store, name) {
    for (let chart of store.getters.charts) {
      let chartKey = chart.path.split('/').pop()
      if (chartKey === name) {
        await API.chart({ id: chart.id }, 'delete')
        this.unregisterModule(chart.path.split('/'))
      }
    }
    // Force reload by committing something
    store.commit('dateInterval', store.getters.dateInterval)
  },

  // Default block for Aqcuisuites & Tesla Solar Panels
  async loadDefault (store, payload) {
    store.commit(
      'promise',
      new Promise(async (resolve, reject) => {
        store.commit('shuffleChartColors')
        let chartSpace = 'chart_' + payload.id.toString()
        let moduleSpace = store.getters.path + '/' + chartSpace
        this.registerModule(moduleSpace.split('/'), Chart)
        let utilityType = ''
        if (this.getters[payload.group.path + '/meters'].length > 0) {
          await this.getters[payload.group.path + '/meters'][0].promise
          utilityType = this.getters[this.getters[payload.group.path + '/meters'][0].path + '/type']
        }
        // this defines the "default chart", "Total Electricity"
        store.commit(chartSpace + '/name', 'Total ' + utilityType)
        const pointMap = {
          Electricity: 'accumulated_real',
          Gas: 'cubic_feet',
          Steam: 'total',
          'Solar Panel': 'energy_change'
        }
        store.commit(chartSpace + '/path', moduleSpace)
        if (utilityType !== '') {
          store.commit(chartSpace + '/point', pointMap[utilityType])
        } else {
          store.commit(chartSpace + '/point', '')
        }
        store.commit(
          chartSpace + '/color',
          store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length]
        )
        let buildingPath = store.getters.path.split('/')
        buildingPath.pop()
        buildingPath = buildingPath.join('/')
        store.commit(chartSpace + '/building', buildingPath)
        store.commit(chartSpace + '/meterGroupPath', payload.group.path)

        store.commit('name', utilityType)

        // default chart settings
        store.commit('dateInterval', 1)
        store.commit('graphType', 1)
        store.commit('intervalUnit', 'day')

        let currentEpoch = new Date().getTime()
        currentEpoch = currentEpoch - (currentEpoch % (900 * 1000))

        store.commit('dateStart', currentEpoch - 900 * 96 * 60 * 1000) // 15 minutes, 96 times a day, 30 days
        store.commit('dateEnd', currentEpoch)
        resolve()
      })
    )
    return store.getters.promise
  },

  async getData (store) {
    let chartDataPromises = []
    let data = {
      labels: [],
      datasets: []
    }
    let reqPayload = {
      dateStart: parseInt(store.getters.dateStart / 1000),
      dateEnd: parseInt(store.getters.dateEnd / 1000),
      intervalUnit: store.getters.intervalUnit,
      dateInterval: store.getters.dateInterval,
      graphType: store.getters.graphType,
      timeZoneOffset: store.getters.timeZoneOffset
    }

    for (let mod of store.getters.modifiers) {
      await mod.preData(this, store, reqPayload)
    }
    for (let chart of store.getters.charts) {
      if (!chart.path) continue
      let multStartArray = JSON.parse(JSON.stringify(chart.multStart))
      let multEndArray = JSON.parse(JSON.stringify(chart.multEnd))
      if (multStartArray.length > 1 && multEndArray.length > 1) {
        for (let i in multStartArray) {
          reqPayload = {
            dateStart: parseInt(multStartArray[i] / 1000),
            dateEnd: parseInt(multEndArray[i] / 1000),
            intervalUnit: store.getters.intervalUnit,
            dateInterval: store.getters.dateInterval,
            graphType: store.getters.graphType,
            timeZoneOffset: store.getters.timeZoneOffset,
            // See chart.module.js file for rest of color stuff
            color: store.getters.chartColors[parseInt(i) + 1]
          }
          chartDataPromises.push(this.dispatch(chart.path + '/getData', reqPayload))
        }
      } else {
        chartDataPromises.push(this.dispatch(chart.path + '/getData', reqPayload))
      }
    }
    let chartData = await Promise.all(chartDataPromises)
    if (store.getters.graphType !== 100) {
      if (store.getters.graphType === 3 || store.getters.graphType === 4) {
        data.datasets.push({
          data: chartData.map(o => o.data[0]),
          backgroundColor: chartData.map(o => o.backgroundColor)
        })
        data.labels = chartData.map(o => o.label)
      } else {
        data.datasets = chartData
      }
    }
    for (let mod of store.getters.modifiers) {
      await mod.postData(this, store, data)
    }
    // console.log(data, 'is chart data!')
    return data
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },
  // seconds to add from starting time_seconds in dateStart
  timeZoneOffset (state, offset) {
    state.timeZoneOffset = offset
  },

  shuffleChartColors (state) {
    for (var i = state.chartColors.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = state.chartColors[i]
      state.chartColors[i] = state.chartColors[j]
      state.chartColors[j] = temp
    }
  },

  addMod (state, mod) {
    state.modifiers.push(mod)
  },

  removeMod (state, mod) {
    const modIndex = state.modifiers.map(o => o.name).indexOf(mod.nam)
    state.modifiers.splice(modIndex, 1)
  },

  promise (state, promise) {
    state.promise = promise
  },

  name (state, name) {
    state.name = name
  },

  dateInterval (state, dateInterval) {
    state.dateInterval = dateInterval
  },

  intervalUnit (state, intervalUnit) {
    state.intervalUnit = intervalUnit
  },

  graphType (state, graphType) {
    state.graphType = graphType
  },

  dateStart (state, dateStart) {
    if (typeof dateStart === 'string') {
      state.dateStart = new Date(dateStart).getTime()
    } else if (typeof dateStart === 'number') {
      state.dateStart = dateStart
    } else if (dateStart instanceof Date) {
      state.dateStart = dateStart.getTime()
    } else {
      throw new Error('Unrecognized format sent to dateStart')
    }
  },

  dateEnd (state, dateEnd) {
    if (typeof dateEnd === 'string') {
      state.dateEnd = new Date(dateEnd).getTime()
    } else if (typeof dateEnd === 'number') {
      state.dateEnd = dateEnd
    } else if (dateEnd instanceof Date) {
      state.dateEnd = dateEnd.getTime()
    } else {
      throw new Error('Unrecognized format sent to dateEnd')
    }
  },

  id (state, id) {
    state.id = id
  }
}

const getters = {
  state: state => {
    return state
  },

  timeZoneOffset: state => {
    return state.timeZoneOffset
  },

  modifierData: state => modifierName => {
    for (let modifier of state.modifiers) {
      // eslint-disable-next-line no-proto
      if (modifier.__proto__.constructor.name === modifierName) {
        return modifier.data
      }
    }
  },

  modifiers: state => {
    return state.modifiers
  },

  name: state => {
    return state.name
  },

  path: state => {
    return state.path
  },

  promise: state => {
    return state.promise
  },

  dateInterval: state => {
    return state.dateInterval
  },

  intervalUnit: state => {
    return state.intervalUnit
  },

  graphType: state => {
    return state.graphType
  },

  dateStart: state => {
    return state.dateStart
  },

  dateEnd: state => {
    return state.dateEnd
  },

  id: state => {
    return state.id
  },

  chartColors: state => {
    return state.chartColors
  },

  charts: state => {
    let charts = []
    for (let key of Object.keys(state)) {
      if (key.search(/chart_/) >= 0) {
        charts.push(state[key])
      }
    }
    return charts
  },

  chart: state => id => {
    return state[`chart_${id}`]
  }
}
/*
  Nested Modules Populated with Charts
*/
const modules = {}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
