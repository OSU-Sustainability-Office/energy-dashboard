/*
  Filename: building.module.js
  Info: Vuex module for handling and storing buildings.
*/
import MeterGroup, { withMeters } from './meter_group.module.js'
import Block from './block.module.js'
import Chart from './chart.module.js'
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
    id: null,
    hidden: null
  }
}

const actions = {
  async loadMeterGroup(store, payload) {
    let meterGroupSpace = 'meterGroup_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + meterGroupSpace
    // Already present when the group came in as part of a pre-built subtree
    // (see withMeterGroups); re-registering would pay another full getter rebuild.
    if (!this.hasModule(moduleSpace.split('/'))) {
      this.registerModule(moduleSpace.split('/'), withMeters(payload))
    }
    store.commit(meterGroupSpace + '/path', moduleSpace)
    store.commit(meterGroupSpace + '/building', store.getters.path)
    store.commit(meterGroupSpace + '/name', payload.name)
    store.commit(meterGroupSpace + '/id', payload.id)
    store.commit(meterGroupSpace + '/default', payload.default)
    store.commit(meterGroupSpace + '/type', payload.meters[0].type)
    store.commit('addType', payload.meters[0].type)
    let meterPromises = []
    for (let meter of payload.meters) {
      meterPromises.push(store.dispatch(meterGroupSpace + '/loadMeter', meter))
    }
    await Promise.all(meterPromises)
  },

  async removeAllMeterGroups(store) {
    for (let meterGroup of store.getters.meterGroups) {
      this.unregisterModule(meterGroup.path.split('/'))
    }
  },

  async update(store, payload) {
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
      reqPayload.meters = []
      for (let group of store.getters.meterGroups) {
        let payloadGroup = {
          name: this.getters[group.path + '/name'],
          id: this.getters[group.path + '/id'],
          meters: {}
        }
        reqPayload.reqPayload.meters.push(payloadGroup)
      }
    }
    let res = await API.building('put', reqPayload)
    if (res.status === 200) {
      store.commit('name', reqPayload.name)
      store.commit('image', reqPayload.image)
      store.commit('mapId', reqPayload.mapId)
      store.commit('group', reqPayload.group)
      // Reload with API calls, inefficient but buildings rarely updated
      await store.dispatch('removeAllMeterGroups')
      for (let meterGroup of res.data.meterGroups) {
        store.dispatch('loadMeterGroup', { id: meterGroup })
      }
    }
  },

  async buildDefaultBlocks(store, payload) {
    for (let group of store.getters.meterGroups) {
      await group.promise
      if (group.default) {
        let blockSpace = 'block_' + group.id.toString()
        let moduleSpace = store.getters.path + '/' + blockSpace
        // Normally already present, attached to the building by withMeterGroups.
        // Still registered here for groups that became default after load.
        if (!this.hasModule(moduleSpace.split('/'))) {
          this.registerModule(moduleSpace.split('/'), {
            ...Block,
            modules: { ['chart_' + group.id.toString()]: Chart }
          })
        }
        store.commit(blockSpace + '/path', moduleSpace)
        store.dispatch(blockSpace + '/loadDefault', {
          group: group,
          id: group.id
        })
      }
    }
  }
}

const mutations = {
  promise(state, promise) {
    state.promise = promise
  },

  hidden(state, hide) {
    state.hidden = hide
  },

  mapId(state, mapId) {
    state.mapId = mapId
  },

  name(state, name) {
    state.name = name
  },

  group(state, group) {
    state.group = group
  },

  image(state, image) {
    state.image = image
  },

  geoJSON(state, geoJSON) {
    state.geoJSON = geoJSON
  },

  id(state, id) {
    state.id = id
  },

  path(state, path) {
    state.path = path
  },

  addType(state, type) {
    if (state.description.search(new RegExp(`${type}`, 'gi')) < 0) {
      if (state.description === '') {
        state.description += type
      } else {
        state.description += ', ' + type
      }
    }
  }
}

const getters = {
  promise(state) {
    return state.promise
  },
  hidden(state) {
    return state.hidden
  },

  mapId(state) {
    return state.mapId
  },
  name(state) {
    return state.name
  },

  group(state) {
    return state.group
  },

  image(state) {
    return state.image
  },

  geoJSON(state) {
    return state.geoJSON
  },

  id(state) {
    return state.id
  },

  description(state) {
    return state.description
  },

  path(state) {
    return state.path
  },

  meterGroups(state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/meterGroup_[0-9]+/) >= 0) {
        r.push(state[key])
      }
    }
    return r
  },

  blocks(state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/block_[0-9]+/) >= 0) {
        r.push(state[key])
      }
    }
    return r
  },

  block: state => id => {
    return state[`block_${id}`]
  },

  primaryGroup: state => type => {
    for (let key of Object.keys(state)) {
      if (key.search(/meterGroup_[0-9]+/) >= 0) {
        if (state[key].default && state[key].type === type) {
          return state[key]
        }
      }
    }
    return null
  }
}
/*
  Nested Modules Populated with Buildings
*/
const modules = {}

const Building = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}

/*
  Returns a building module with everything startup will need already attached --
  its meter groups, their meters, and the default block plus chart each default
  group gets (see buildDefaultBlocks) -- so one registerModule call covers the
  whole building. See withMeters for why this matters.
*/
export function withMeterGroups(building) {
  const children = {}
  for (const meterGroup of building.meterGroups || []) {
    const groupId = meterGroup.id.toString()
    children['meterGroup_' + groupId] = withMeters(meterGroup)
    if (meterGroup.default) {
      children['block_' + groupId] = { ...Block, modules: { ['chart_' + groupId]: Chart } }
    }
  }
  return { ...Building, modules: children }
}

export default Building
