/*
 * @Author: you@you.you
 * @Date:   Tuesday December 17th 2019
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Tuesday December 17th 2019
 * @Copyright:  (c) Oregon State University 2019
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
    console.log(state.data)
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
