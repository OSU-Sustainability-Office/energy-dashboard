/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Block from './block.module.js'

const state = () => {
  return {
    name: null,       // String
    user: null,       // String
    media: null,      // URL String
    id: null,         // Integer DB ID
    path: null,
    promise: null,
    description: ''
  }
}

const actions = {
  loadBlock (store, payload) {
    let blockSpace = 'block_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + blockSpace

    this.registerModule(moduleSpace.split('/'), Block)

    store.commit(blockSpace + '/path', moduleSpace)
    store.dispatch(blockSpace + '/changeBlock', payload.id)
  },

  async loadBlocks (store, blocks) {
    console.log(blocks)
    for (let block of blocks) {
      let blockSpace = 'block_' + block.id
      let moduleSpace = store.getters.path + '/' + blockSpace
      this.registerModule(moduleSpace.split('/'), Block)
      store.commit(blockSpace + '/path', moduleSpace)
      let viewBlockPromise = store.dispatch(blockSpace + '/loadCharts', block.charts)
      store.commit(blockSpace + '/promise', viewBlockPromise)

      store.commit(blockSpace + '/name', block.name)
      store.commit(blockSpace + '/dateInterval', block.dateInterval)
      store.commit(blockSpace + '/intervalUnit', block.intervalUnit)
      store.commit(blockSpace + '/graphType', block.graphType)
      store.commit(blockSpace + '/dateStart', block.dateStart)
      store.commit(blockSpace + '/dateEnd', block.dateEnd)
      store.commit(blockSpace + '/id', block.id)
      store.commit(blockSpace + '/shuffleChartColors')
    }
  },

  async changeView (store, id) {
    for (let blockId of Object.keys(store.modules)) {
      store.unregisterModule(blockId)
    }
    let view = await API.view(id)
    store.commit('name', view.name)
    store.commit('user', view.user)
    store.commit('media', view.media)
    store.commit('id', id)
    for (let block of view.blocks) {
      store.dispatch('loadBlock', block)
    }
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },

  promise (state, promise) {
    state.promise = promise
  },

  name (state, name) {
    state.name = name
  },

  user (state, user) {
    state.user = user
  },

  media (state, media) {
    state.media = media
  },

  id (state, id) {
    state.id = id
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

  user (state) {
    return state.user
  },

  media (state) {
    return state.media
  },

  id (state) {
    return state.id
  },

  description (state) {
    return state.description
  }
}
/*
  Nested Modules Populated with Blocks
*/
const modules = { }

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
