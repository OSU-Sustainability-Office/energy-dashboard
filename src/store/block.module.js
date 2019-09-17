/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Chart from './chart.module.js'

const state = () => {
  return {
    path: null,
    promise: null,
    name: null,               // String
    dateInterval: null,       // Int
    intervalUnit: null,       // String (minute, hour, day)
    graphType: null,          // Int (1: Line, 2: Bar, 3: Doughnut, 4: Piechart, 5: LineBar)
    dateStart: null,          // String ISO date format UTC
    dateEnd: null,            // String ISO date format UTC
    id: null,                  // Integer DB ID
    chartColors: ['#4A773C', '#00859B', '#FFB500', '#AA9D2E', '#D3832B', '#0D5257', '#7A6855', '#C4D6A4']
  }
}

const actions = {
  loadChart (store, id) {
    let chartSpace = 'chart_' + id.toString()
    let moduleSpace = store.getters.path + chartSpace
    store.registerModule(moduleSpace.split('/'), Chart)
    store.commit(chartSpace + '/path', moduleSpace)
    store.commit(chartSpace + '/color', store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length])
    store.dispatch(chartSpace + '/changeChart', id)
  },

  async changeBlock (store, id) {
    store.commit('shuffleChartColors')
    for (let chart of store.getters.charts) {
      let chartKey = chart.path.split('/').pop()
      store.unregisterModule(chartKey)
    }
    store.commit('id', id)
    let block = API.block(id)
    store.commit('promise', block)
    block = await block
    store.commit('name', block.name)
    store.commit('dateInterval', block.user)
    store.commit('intervalUnit', block.media)
    store.commit('graphType', block.graphType)
    store.commit('dateStart', block.dateStart)
    store.commit('dateEnd', block.dateStart)

    for (let chart of block.charts) {
      store.dispatch('loadChart', chart)
    }
  },

  async loadDefault (store, payload) {
    store.commit('shuffleChartColors')
    let chartSpace = 'chart_' + payload.id.toString()
    let moduleSpace = (store.getters.path + '/' + chartSpace)
    this.registerModule(moduleSpace.split('/'), Chart)
    await this.getters[payload.group.path + '/meters'][0].promise
    let utilityType = this.getters[this.getters[payload.group.path + '/meters'][0].path + '/type']
    store.commit(chartSpace + '/name', 'Total ' + utilityType)
    const pointMap = {
      'Electricity': 'accumulated_real',
      'Gas': 'cubic_feet',
      'Steam': 'total'
    }
    store.commit(chartSpace + '/path', moduleSpace)
    store.commit(chartSpace + '/point', pointMap[utilityType])
    store.commit(chartSpace + '/color', store.getters.chartColors[(store.getters.charts.length - 1) % store.getters.chartColors.length])
    let buildingPath = store.getters.path.split('/')
    buildingPath.pop()
    buildingPath = buildingPath.join('/')
    store.commit(chartSpace + '/building', buildingPath)
    store.commit(chartSpace + '/meterGroupPath', payload.group.path)

    store.commit('name', utilityType)
    store.commit('dateInterval', 1)
    store.commit('intervalUnit', 'day')
    store.commit('graphType', 1)
    let currentEpoch = ((new Date()).getTime())
    currentEpoch = currentEpoch - (currentEpoch % 900)
    store.commit('dateStart', currentEpoch - (900 * 96 * 7 * 1000)) // 15 minutes, 96 times a day, 7 days
    store.commit('dateEnd', currentEpoch)
  },

  async getData (store) {
    const reqPayload = {
      point: store.getters.point,
      dateStart: store.getters.dateStart / 1000,
      dateEnd: store.getters.dateEnd / 1000,
      intervalUnit: store.getters.intervalUnit,
      dateInterval: store.getters.dateInterval
    }
    let chartDataPromises = []
    let data = {
      labels: [],
      datasets: []
    }
    for (let chart of store.getters.charts) {
      data.labels.push(this.getters[chart.path + '/name'])
      chartDataPromises.push(this.dispatch(chart.path + '/getData', reqPayload))
    }
    let chartData = await Promise.all(chartDataPromises)

    if (store.getters.graphType === 1) {
      data.datasets = chartData
    }
    return data
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },

  shuffleChartColors (state) {
    for (var i = state.chartColors.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = state.chartColors[i]
      state.chartColors[i] = state.chartColors[j]
      state.chartColors[j] = temp
    }
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
    state.dateStart = dateStart
  },

  dateEnd (state, dateEnd) {
    state.dateEnd = dateEnd
  },

  id (state, id) {
    state.id = id
  }

}

const getters = {
  name (state) {
    return state.name
  },

  path (state) {
    return state.path
  },

  promise (state) {
    return state.promise
  },

  dateInterval (state) {
    return state.dateInterval
  },

  intervalUnit (state) {
    return state.intervalUnit
  },

  graphType (state) {
    return state.graphType
  },

  dateStart (state) {
    return state.dateStart
  },

  dateEnd (state) {
    return state.dateEnd
  },

  id (state) {
    return state.id
  },

  chartColors (state) {
    return state.chartColors
  },

  charts (state) {
    let charts = []
    for (let key of Object.keys(state)) {
      if (key.search(/chart_/) >= 0) {
        charts.push(state[key])
      }
    }
    return charts
  }
}
/*
  Nested Modules Populated with Charts
*/
const modules = { }

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
