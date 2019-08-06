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
    negate: null        // Bool
  }
}

const actions = {

  async changeMeter (store, id) {
    let meter = await API.meter(id)
    store.commit('id', id)
    store.commit('name', meter.name)
    store.commit('address', meter.address)
    store.commit('classInt', meter.classInt)
    store.commit('negate', meter.negate)
  },

  async getData (store, payload) {
    return API.data(store.getters.id, payload.dateStart, payload.dateEnd, payload.point)
  }

}

const mutations = {
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
  }

}

const getters = {
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
