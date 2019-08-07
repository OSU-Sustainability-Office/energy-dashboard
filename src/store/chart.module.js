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

  async getData (store, payload) {
    let allData = await store.dispatch('MeterGroup/getData', payload)
    let delta = 1
    switch (payload.intervalUnit) {
      case 'minute':
        delta = 1
        break
      case 'hour':
        delta = 4
        break
      case 'day':
        delta = 96
        break
    }
    if (payload.intervalUnit === 'minute') {
      payload.dateInterval /= 15
    }
    delta *= payload.dateInterval
    let returnData = []
    // Leave out first point as it contains non subtracted data for totals
    for (let i = 0; i < allData.size - 1; i += delta) {
      returnData.push({ x: allData.keys()[i], y: allData.values()[i] })
    }
    return returnData
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
