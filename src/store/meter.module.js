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
    promise: null,
    type: ''
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
    let type = ''
    switch (meter.classInt) {
      case 17:
        type = 'Gas'
        break
      case 4444:
        type = 'Steam'
        break
      default:
        type = 'Electricity'
        break
    }
    store.commit('type', type)
  },

  async getData (store, payload) {
    let start = new Date(payload.dateStart * 1000 - 900)
    let end = new Date(payload.dateEnd * 1000)
    console.log(payload)
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
  },

  type (state, type) {
    state.type = type
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
    return state.type
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
