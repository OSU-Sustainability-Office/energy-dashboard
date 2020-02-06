/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

import api from './api.js'

const state = () => {
  return {
    promise: null,
    path: null,
    id: null,
    name: null,
    date_start: null,
    date_end: null,
    compare_start: null,
    compare_end: null,
    media: null
  }
}

const actions = {


}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  },

  name (state, name) {
    state.name = name
  },

  id (state, id) {
    state.id = id
  },

  path (state, path) {
    state.path = path
  },

  date_start (state, date_start) {
    state.date_start = date_start
  },

  date_end (state, date_end) {
    state.date_end = date_end
  },

  compare_start (state, compare_start) {
    state.compare_start = compare_start
  },

  compare_end (state, compare_end) {
    state.compare_end = compare_end
  },

  media (state, media) {
    state.media = media
  }
}

const getters = {
  promise (state, promise) {
    return state.promise
  },

  name (state, name) {
    return state.name
  },

  id (state, id) {
    return state.id
  },

  path (state, path) {
    return state.path
  },

  date_start (state, date_start) {
    return state.date_start
  },

  date_end (state, date_end) {
    return state.date_end
  },

  compare_start (state, compare_start) {
    return state.compare_start
  },

  compare_end (state, compare_end) {
    return state.compare_end
  },

  media (state, media) {
    return state.media
  },

  getAllData (state, media) {
    return state
  }

}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
