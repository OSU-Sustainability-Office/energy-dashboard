/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Data from './data.module.js'
import meterGroup from './meter_group.module.js'

const state = () => {
  return {
    name: null,               // String
    point: null,              // String (See metering points)
    building: null,           // String buildingId
    id: null                  // Integer DB ID
  }
}

const actions = {

  async changeMeterGroup (store, id) {
    store.dispatch('MeterGroup/changeGroup', id)
  },

  async loadData (store, id) {

  },

  async changeChart (store, id) {
    let chart = await API.chart(id)
    store.commit('name', chart.name)
    store.commit('point', chart.point)
    store.commit('building', chart.building)
    store.commit('id', id)
  }

}

const mutations = {
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
  }

}

const getters = {
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
  }
}

const modules = {
  meterGroup: meterGroup,
  data: Data
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
