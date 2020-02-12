/*
 * @Author: you@you.you
 * @Date:   Saturday February 1st 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday February 1st 2020
 * @Copyright:  (c) Oregon State University 2020
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
