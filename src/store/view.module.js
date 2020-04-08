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
    image: null,      // URL String
    id: null,         // Integer DB ID
    path: 'view',
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

  async delete (store) {
    await API.view(null, { id: store.getters.id }, 'delete')
  },

  async deleteBlock (store, id) {
    let block = store.getters.block(id)
    await API.block({ id: id }, 'delete')
    this.unregisterModule(block.path.split('/'))
  },

  async newBlock (store, payload) {
    let id = (await API.block({
      dateStart: payload.dateStart,
      dateEnd: payload.dateEnd,
      graphType: payload.graphType,
      name: payload.name,
      dateInterval: payload.dateInterval,
      intervalUnit: payload.intervalUnit,
      storyId: store.getters.id
    }, 'post')).id

    let blockSpace = 'block_' + id.toString()
    let moduleSpace = store.getters.path + '/' + blockSpace
    this.registerModule(moduleSpace.split('/'), Block)
    store.commit(blockSpace + '/path', moduleSpace)
    store.commit(blockSpace + '/id', id)
    store.commit(blockSpace + '/name', payload.name)
    store.commit(blockSpace + '/dateInterval', payload.dateInterval)
    store.commit(blockSpace + '/intervalUnit', payload.intervalUnit)
    store.commit(blockSpace + '/graphType', payload.graphType)
    store.commit(blockSpace + '/dateStart', payload.dateStart)
    store.commit(blockSpace + '/dateEnd', payload.dateEnd)
    store.commit(blockSpace + '/shuffleChartColors')
    return moduleSpace
  },

  async save (store, payload) {
    store.commit('name', payload.name)
    store.commit('image', payload.media)
    await API.view(store.getters.id, {
      name: payload.name,
      media: payload.media,
      id: store.getters.id
    }, 'put')
  },

  async loadBlocks (store, blocks) {
    let promises = []
    for (let block of blocks) {
      let blockSpace = 'block_' + block.id
      let moduleSpace = store.getters.path + '/' + blockSpace
      this.registerModule(moduleSpace.split('/'), Block)
      store.commit(blockSpace + '/path', moduleSpace)
      store.commit(blockSpace + '/shuffleChartColors')
      let viewBlockPromise = store.dispatch(blockSpace + '/loadCharts', block.charts)
      store.commit(blockSpace + '/promise', viewBlockPromise)
      promises.push(viewBlockPromise)
      store.commit(blockSpace + '/name', block.name)
      store.commit(blockSpace + '/dateInterval', block.dateInterval)
      store.commit(blockSpace + '/intervalUnit', block.intervalUnit)
      store.commit(blockSpace + '/graphType', block.graphType)
      store.commit(blockSpace + '/dateStart', block.dateStart)
      store.commit(blockSpace + '/dateEnd', block.dateEnd)
      store.commit(blockSpace + '/id', block.id)
    }

    await Promise.all(promises)
  },

  async changeView (store, id) {
    console.log('Changing stuff')
    if (id !== store.getters.id) {
      store.commit('promise', new Promise(async (resolve, reject) => {
        for (let block of store.getters.blocks) {
          this.unregisterModule(block.path.split('/'))
        }
        let view = await API.view(id)
        store.commit('name', view.name)
        store.commit('user', view.user)
        store.commit('image', view.media)
        store.commit('id', id)
        await store.dispatch('loadBlocks', view.blocks)
        resolve()
      }))
    }
    return store.getters.promise
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

  image (state, image) {
    state.image = image
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

  image (state) {
    return state.image
  },

  id (state) {
    return state.id
  },

  description (state) {
    return state.description
  },

  block: (state) => (id) => {
    return state['block_' + id]
  },

  blocks (state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/block_[0-9]+/) >= 0) {
        r.push(state[key])
      }
    }
    return r
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
