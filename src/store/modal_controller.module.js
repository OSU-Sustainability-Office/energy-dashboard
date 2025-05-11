/**
  Filename: modal_controller.module.js
  Info: Vuex module for controlling modal dialogs (e.g. popup that appears when a user clicks
  on a building on the map).
*/

const state = () => {
  return {
    modalName: '',
    data: {}
  }
}

const actions = {
  openModal (store, payload) {
    store.commit('clearData')
    store.commit('data', payload)
    store.commit('modalName', payload['name'])
  },

  closeModal (store) {
    store.commit('modalName', '')
  }
}

const mutations = {
  modalName (state, name) {
    state.modalName = name
  },

  clearData (state) {
    state.data = {}
  },

  data (state, data) {
    state.data = JSON.parse(JSON.stringify(data))
  }
}

const getters = {
  modalName (state) {
    return state.modalName
  },

  data (state) {
    return state.data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
