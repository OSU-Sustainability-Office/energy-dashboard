/**
  Filename: map.module.js
  Info: "Map" module handles map-geometry data and dynamically loads all the building modules.
*/
import API from './api.js'
import Building from './building.module.js'

const state = () => {
  return {
    path: 'map',
    promise: null
  }
}

const actions = {
  async loadBuilding (store, payload) {
    let buildingSpace = 'building_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + buildingSpace
    this.registerModule(moduleSpace.split('/'), Building)
    store.commit(buildingSpace + '/path', moduleSpace)
    store.commit(buildingSpace + '/mapId', payload.mapId)
    store.commit(buildingSpace + '/name', payload.name)
    store.commit(buildingSpace + '/group', payload.group)
    store.commit(buildingSpace + '/image', payload.image)
    store.commit(buildingSpace + '/id', payload.id)
    store.commit(buildingSpace + '/hidden', payload.hidden)
    store.commit(buildingSpace + '/geoJSON', JSON.parse(payload.geoJSON))
    let mgPromises = []
    for (let meterGroup of payload.meterGroups) {
      mgPromises.push(store.dispatch(buildingSpace + '/loadMeterGroup', meterGroup))
    }
    await Promise.all(mgPromises)
    await store.dispatch(buildingSpace + '/buildDefaultBlocks')
  },

  async deleteBuilding (store, payload) {
    let buildingPath = ['map', 'building_' + payload.id]
    this.unregisterModule(buildingPath)
    API.building('delete', payload)
  },

  async newBuilding (store, payload) {
    let building = await API.building('post', {
      image: payload.image,
      group: payload.group,
      mapId: payload.mapId,
      meters: payload.meters
    })
    store.dispatch('loadBuilding', { id: building.data.id })
  },

  async allDevices (store, payload) {
    return API.devices()
  },

  async imageList (store) {
    return API.images()
  },

  async loadMap (store) {
    if (store.getters.promise === null) {
      store.commit(
        'promise',
        new Promise(async (resolve, reject) => {
          let buildingsResolved = await API.buildings()
          let buildingPromises = []
          for (let building of buildingsResolved) {
            buildingPromises.push(store.dispatch('loadBuilding', building))
          }
          await Promise.all(buildingPromises)
          resolve()
        })
      )
    }
    return store.getters.promise
  }
}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  }
}

const getters = {
  path (state) {
    return state.path
  },

  promise (state) {
    return state.promise
  },

  building: state => id => {
    return state['building_' + id.toString()]
  },

  buildingGroups: state => {
    let groups = new Set()
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0) {
        if (state[key].group) {
          groups.add(state[key].group)
        }
      }
    }
    return groups
  },

  buildingsForGroup: state => group => {
    let buildings = []
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0 && state[key].group === group) {
        if (!state[key].hidden) {
          buildings.push(state[key])
        }
      }
    }
    return buildings
  },

  buildings: state => {
    let buildings = []
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0) {
        if (!state[key].hidden) {
          buildings.push(state[key])
        }
      }
    }
    return buildings
  },

  meterGroup: state => id => {
    let meterGroups = {}
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0) {
        for (let buildingKey of Object.keys(state[key])) {
          if (buildingKey.search(/meterGroup_/ >= 0)) {
            meterGroups[buildingKey.replace('meterGroup_', '')] = state[key][buildingKey]
          }
        }
      }
    }
    return meterGroups[id]
  }
}
/*
  Nested Modules Populated with Buildings
*/
const modules = {}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
