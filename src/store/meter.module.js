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
    id: null,           // Integer DB ID
    name: null,         // String
    address: null,      // String
    classInt: null,     // Int
    negate: null,        // Bool
    path: null,
    promise: null
  }
}

const actions = {

  async changeMeter (store, id) {
    let meter = API.meter(id)
    store.commit('promise', meter)
    meter = await meter
    store.commit('id', id)
    store.commit('name', meter.name)
    store.commit('address', meter.address)
    store.commit('classInt', meter.classInt)
    store.commit('negate', meter.negate)
  },

  async getData (store, payload) {
    let start = new Date(payload.dateStart * 1000)
    let end = new Date(payload.dateEnd * 1000)
    return API.data(store.getters.id, start.toISOString(), end.toISOString(), payload.point, store.getters.classInt)
  }

}

const mutations = {
  path (state, path) {
    state.path = path
  },

  name (state, name) {
    state.name = name
  },

  address (state, address) {
    state.address = address
  },

  classInt (state, classInt) {
    state.classInt = classInt
  },

  negate (state, negate) {
    state.negate = negate
  },

  id (state, id) {
    state.id = id
  },

  promise (state, promise) {
    state.promise = promise
  }

}

const getters = {
  path (state) {
    return state.path
  },

  promise (state) {
    return state.promise
  },

  name (state) {
    return state.name
  },

  address (state) {
    return state.address
  },

  classInt (state) {
    return state.classInt
  },

  negate (state) {
    return state.negate
  },

  id (state) {
    return state.id
  },

  type (state) {
    switch (state.class) {
      case 17:
        return 'Gas'
      case 4444:
        return 'Steam'
      default:
        return 'Electricity'
    }
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
