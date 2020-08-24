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
    type: '',
    points: null
  }
}

const actions = {

  async changeMeter (store, id) {
    let meter = API.meter(id)
    let wait = true
    store.commit('promise', new Promise((resolve, reject) => {
      let fn = () => {
        if (wait) {
          setTimeout(fn, 100)
        } else {
          resolve()
        }
      }
      fn()
    }))
    meter = await meter
    store.commit('id', id)
    store.commit('name', meter.name)
    store.commit('address', meter.address)
    store.commit('classInt', meter.classInt)
    store.commit('negate', meter.negate)
    store.commit('points', meter.points)
    store.commit('type', meter.type)
    wait = false
    return store.state
  },

  async getData (store, payload) {
    let start = payload.dateStart - 900
    let end = payload.dateEnd
    await store.getters.promise
    return this.dispatch('dataStore/getData', {
      meterId: store.getters.id,
      start: start,
      end: end,
      uom: payload.point,
      classInt: store.getters.classInt
    })
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
  },

  points (state, points) {
    state.points = points
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
  },

  points (state) {
    return state.points
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
