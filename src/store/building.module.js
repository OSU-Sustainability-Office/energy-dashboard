/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import MeterGroup from './meter_group.module.js'
import Block from './block.module.js'
import API from './api.js'

const state = () => {
  return {
    promise: null,
    path: null,
    name: null,
    group: null,
    image: null,
    geoJSON: null,
    description: '',
    mapId: null,
    id: null
  }
}

const actions = {
  async loadMeterGroup (store, payload) {
    let meterGroupSpace = 'meterGroup_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + meterGroupSpace
    this.registerModule(moduleSpace.split('/'), MeterGroup)
    store.commit(meterGroupSpace + '/path', moduleSpace)
    store.commit(meterGroupSpace + '/building', store.getters.path)
    store.dispatch(meterGroupSpace + '/changeGroup', { id: payload.id }).then(async group => {
      await this.getters[group.path + '/meters'][0].promise
      store.commit('addType', this.getters[group.path + '/meters'][0].type)
    })
  },

  async update (store, payload) {
    let reqPayload = {
      ...payload,
      id: store.getters.id
    }
    if (!reqPayload.image) {
      reqPayload.image = store.getters.image
    }
    if (!reqPayload.mapId) {
      reqPayload.mapId = store.getters.mapId
    }
    if (!reqPayload.group) {
      reqPayload.group = store.getters.group
    }
    if (!reqPayload.meters) {
      //TODO
    }
    let status = await API.building('put', reqPayload)
    if (status === 200) {
      store.commit('image', reqPayload.image)
      store.commit('mapId', reqPayload.mapId)
      store.commit('group', reqPayload.group)
    }
  },

  async buildDefaultBlocks (store, payload) {
    for (let group of store.getters.meterGroups) {
      await group.promise
      if (group.default) {
        let blockSpace = 'block_' + group.id.toString()
        let moduleSpace = store.getters.path + '/' + blockSpace
        this.registerModule(moduleSpace.split('/'), Block)
        store.commit(blockSpace + '/path', moduleSpace)
        store.dispatch(blockSpace + '/loadDefault', { group: group, id: group.id })
      }
    }
  }
}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  },

  mapId (state, mapId) {
    state.mapId = mapId
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
    if (state.description.search(`/${type}/gi`) < 0) {
      if (state.description === '') {
        state.description += type
      } else {
        state.description += ', ' + type
      }
    }
  }
}

const getters = {
  promise (state) {
    return state.promise
  },
  mapId (state) {
    return state.mapId
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

  description (state) {
    return state.description
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
