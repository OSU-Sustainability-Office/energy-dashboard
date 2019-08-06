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
    name: null,               // String
    dateInterval: null,       // Int
    intervalUnit: null,       // String (minute, hour, day)
    graphType: null,          // Int (1: Line, 2: Bar, 3: Doughnut, 4: Piechart, 5: LineBar)
    dateStart: null,          // String ISO date format UTC
    dateEnd: null,            // String ISO date format UTC
    id: null                  // Integer DB ID
  }
}

const actions = {
  loadChart (store, id) {
    store.registerModule(id, Chart)
    store.dispatch(id.toString() + '/changeChart', id)
  },

  async changeBlock (store, id) {
    for (let chartId of Object.keys(store.modules)) {
      store.unregisterModule(chartId)
    }
    let block = await API.block(id)
    store.commit('name', block.name)
    store.commit('dateInterval', block.user)
    store.commit('intervalUnit', block.media)
    store.commit('graphType', block.graphType)
    store.commit('dateStart', block.dateStart)
    store.commit('dateEnd', block.dateStart)
    store.commit('id', id)
    for (let chart of block.charts) {
      store.dispatch('loadChart', chart)
    }
  }
}

const mutations = {
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