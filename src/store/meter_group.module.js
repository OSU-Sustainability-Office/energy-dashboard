/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Meter from './meter.module.js'

const state = () => {
  return {
    id: null,     // Integer DB ID
    name: null    // String
  }
}

const actions = {

  async changeGroup (store, id) {
    let group = await API.meter_group(id)
    store.commit('id', id)
    for (let meterId of group.meters) {
      store.registerModule(meterId, Meter)
      store.dispatch(meterId + '/changeMeter', meterId)
    }
  },

  async getData (store, payload) {
    let resultDataObject = {}
    for (let meter of Object.values(store.modules)) {
      let data = await meter.dispatch('getData', payload)
      for (let dataPoint of data) {
        if (resultDataObject[dataPoint[0]]) {
          if (meter.getters.negate) {
            resultDataObject[dataPoint[0]] -= dataPoint[1]
          } else {
            resultDataObject[dataPoint[0]] += dataPoint[1]
          }
        } else {
          resultDataObject[dataPoint[0]] = dataPoint[1]
        }
      }
    }
  }

}

const mutations = {
  name (state, name) {
    state.name = name
  },

  id (state, id) {
    state.id = id
  }

}

const getters = {
  name (state) {
    return state.name
  },

  id (state) {
    return state.id
  }
}

const modules = { }

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
