/**
  Filename: admin.module.js
  Info: This is the "admin module"--currently unimplemented.
*/
import API from './api.js'

const state = () => {
  return {
  }
}

const actions = {
  async users (store, payload) {
    let users =  await API.users()
    return users
  }
}

const getters = {

}

const mutations = {

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
