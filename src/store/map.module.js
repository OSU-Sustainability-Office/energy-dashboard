/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Building from './building.module.js'
import Geo from 'osmtogeojson'

const state = () => {
  return {
    path: 'map',
    promise: null,
    jsonPromise: null
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
    let mgPromises = []
    for (let meterGroup of payload.meterGroups) {
      mgPromises.push(store.dispatch(buildingSpace + '/loadMeterGroup', meterGroup))
    }
    await Promise.all(mgPromises)
    await store.dispatch(buildingSpace + '/buildDefaultBlocks')
  },

  async loadGeometry (store) {
    if (store.getters.jsonPromise === null) {
      store.commit('jsonPromise', new Promise(async (resolve, reject) => {
        let geoPromise = []
        await store.getters.promise
        // Query for Map Geometry if it exists
        for (let building of store.getters.buildings.filter(b => b.mapId)) {
          geoPromise.push(store.dispatch('buildingJSON', building.mapId).then(json => {
            let way
            for (let feature of json.features) {
              if (feature.id.includes('way')) {
                feature.properties.id = building.id
                feature.properties.group = building.group
                way = feature
              }
            }
            this.commit(building.path + '/geoJSON', way)
          }))
        }
        await Promise.all(geoPromise)
        resolve()
      }))
    }
    return store.getters.jsonPromise
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

  async buildingJSON (store, id) {
    let buildingOSM = await API.buildingFeature(id)
    let buildingParser = new DOMParser()
    let buildingData = buildingParser.parseFromString(buildingOSM, 'text/xml')
    let buildingJSON = Geo(buildingData)
    return buildingJSON
  },

  async boundedWays (store, payload) {
    let features = await API.boundedFeatures(payload)
    let parser = new DOMParser()
    let xmlData = parser.parseFromString(features, 'text/xml')
    let geojson = Geo(xmlData)
    let ways = geojson.features.filter(feature => (feature.id.search(/way\/[0-9]+/) >= 0 && feature.properties.building))
    let promises = []
    for (let way of ways) {
      promises.push(store.dispatch('buildingJSON', way.id.replace('way/', '')))
    }
    return Promise.all(promises)
  },

  async imageList (store) {
    return API.images()
  },

  async loadMap (store) {
    if (store.getters.promise === null) {
      store.commit('promise', new Promise(async (resolve, reject) => {
        let buildingsResolved = await API.buildings()
        let buildingPromises = []
        for (let building of buildingsResolved) {
          buildingPromises.push(store.dispatch('loadBuilding', building))
        }
        await Promise.all(buildingPromises)
        resolve()
      }))
    }
    return store.getters.promise
  }
}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  },

  jsonPromise: (state, promise) => {
    state.jsonPromise = promise
  }
}

const getters = {
  path (state) {
    return state.path
  },

  jsonPromise (state) {
    return state.jsonPromise
  },

  promise (state) {
    return state.promise
  },

  building: (state) => (id) => {
    return state['building_' + id.toString()]
  },

  buildingGroups: (state) => {
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

  buildingsForGroup: (state) => (group) => {
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

  buildings: (state) => {
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

  meterGroup: (state) => (id) => {
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
const modules = { }

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
