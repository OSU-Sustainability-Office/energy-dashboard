/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import MeterGroup from './meter_group.module.js'
import Block from './block.module.js'

const state = () => {
  return {
    promise: null,
    path: null,
    name: null,
    group: null,
    image: null,
    geoJSON: null,
    types: [],
    id: null
  }
}

const actions = {
  async loadMeterGroup (store, payload) {
    let meterGroupSpace = 'meterGroup_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + meterGroupSpace
    this.registerModule(moduleSpace.split('/'), MeterGroup)
    store.commit(meterGroupSpace + '/path', moduleSpace)
    store.dispatch(meterGroupSpace + '/changeGroup', { id: payload.id })
  },

  async buildDefaultBlocks (store, payload) {
    for (let group of store.getters.meterGroups) {
      await group.promise
      if (group.default) {
        store.commit('addType', group.type)
        let blockSpace = 'block_' + group.id.toString()
        let moduleSpace = store.getters.path + '/' + blockSpace
        this.registerModule(moduleSpace.split('/'), Block)
        store.commit(blockSpace + '/path', moduleSpace)
        store.dispatch(blockSpace + '/loadDefault', { group: group, id: group.id })
      }
    }
  },

  async meterTypes (store, payload) {
    let r = {}
    for (let group of store.getters.meterGroups) {
      await group.promise
      let groupSpace = 'meterGroup_' + group.id
      let firstMeter = store.getters[groupSpace + '/meters'][0]
      let meterSpace = groupSpace + '/meter_' + firstMeter.id
      let meterType = store.getters[meterSpace + '/type']
      r[meterType] = 0
    }
    return Object.keys(r)
  }
}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  },

  name (state, name) {
    state.name = name
  },

  group (state, group) {
    state.group = group
  },

  image (state, image) {
    state.image = image
  },

  geoJSON (state, geoJSON) {
    state.geoJSON = geoJSON
  },

  id (state, id) {
    state.id = id
  },

  path (state, path) {
    state.path = path
  },

  addType (state, type) {
    state.types.push(type)
  }
}

const getters = {
  promise (state) {
    return state.promise
  },

  name (state) {
    return state.name
  },

  group (state) {
    return state.group
  },

  image (state) {
    return state.image
  },

  geoJSON (state) {
    return state.geoJSON
  },

  id (state) {
    return state.id
  },

  path (state) {
    return state.path
  },

  meterGroups (state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/meterGroup_[0-9]+/) >= 0) {
        r.push(state[key])
      }
    }
    return r
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
  Nested Modules Populated with Buildings
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
