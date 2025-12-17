/**
  Filename: meter.module.js
  Info: Vuex module for managing meter state, actions, mutations, and getters.
  Handles fetching/updating meter details and retrieving meter-specific data.
*/
import API from './api.js'

const state = () => {
  return {
    id: null, // Integer DB ID
    name: null, // String
    address: null, // String
    classInt: null, // Int
    path: null,
    promise: null,
    type: '',
    points: null
  }
}

const actions = {
  async changeMeter(store, id) {
    let meter = API.meter(id)
    let wait = true
    store.commit(
      'promise',
      new Promise((resolve, reject) => {
        let fn = () => {
          if (wait) {
            setTimeout(fn, 100)
          } else {
            resolve()
          }
        }
        fn()
      })
    )
    meter = await meter
    store.commit('id', id)
    store.commit('name', meter.name)
    store.commit('address', meter.address)
    store.commit('classInt', meter.classInt)
    store.commit('points', meter.points)
    store.commit('type', meter.type)
    wait = false
    return store.state
  },

  async getData(store, payload) {
    let start = payload.dateStart
    let end = payload.dateEnd
    await store.getters.promise
    return this.dispatch('dataStore/getData', {
      meterId: store.getters.id,
      start: start,
      end: end,
      uom: payload.point,
      classInt: store.getters.classInt,
      signal: payload.signal
    })
  }
}

const mutations = {
  path(state, path) {
    state.path = path
  },

  name(state, name) {
    state.name = name
  },

  address(state, address) {
    state.address = address
  },

  classInt(state, classInt) {
    state.classInt = classInt
  },

  id(state, id) {
    state.id = id
  },

  promise(state, promise) {
    state.promise = promise
  },

  type(state, type) {
    state.type = type
  },

  points(state, points) {
    state.points = points
  }
}

const getters = {
  path(state) {
    return state.path
  },

  promise(state) {
    return state.promise
  },

  name(state) {
    return state.name
  },

  address(state) {
    return state.address
  },

  classInt(state) {
    return state.classInt
  },

  id(state) {
    return state.id
  },

  type(state) {
    return state.type
  },

  points(state) {
    return state.points
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
