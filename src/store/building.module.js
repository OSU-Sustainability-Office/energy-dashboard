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
    name: null,
    group: null,
    image: null,
    geoJSON: null,
    id: null
  }
}

const actions = {
  loadMeterGroup (store, payload) {
    let base = [].concat(payload.base, ['meterGroup_' + payload.id.toString()])
    this.registerModule(base, MeterGroup)
    store.dispatch('meterGroup_' + payload.id.toString() + '/changeGroup', { id: payload.id, base: base })
  },

  buildDefaultBlocks (store, payload) {
    for (let group of store.getters.meterGroups) {
      if (group.getters.default) {
        let base = [].concat(payload.base, ['block_' + group.getters.id.toString()])
        this.registerModule(base, Block)
        store.dispatch('block_' + group.id.toString() + '/loadDefault', { base: base, group: group })
      }
    }
  }
}

const mutations = {
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
  }
}

const getters = {
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

  meterGroups (state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/meterGroup_[0-9]+/)) {
        r.push(state[key])
      }
    }
    return r
  },

  blocks (state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/block_[0-9]+/)) {
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
