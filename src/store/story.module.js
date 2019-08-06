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
    id: null          // Integer DB ID
  }
}

const actions = {
  loadBlock (store, id) {
    store.registerModule(id, Block)
    store.dispatch(id.toString() + '/changeBlock', id)
  },

  async changeStory (store, id) {
    for (let blockId of Object.keys(store.modules)) {
      store.unregisterModule(blockId)
    }
    let story = await API.story(id)
    store.commit('name', story.name)
    store.commit('user', story.user)
    store.commit('media', story.media)
    store.commit('id', id)
    for (let block of story.blocks) {
      store.dispatch('loadBlock', block)
    }
  }
}

const mutations = {
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
