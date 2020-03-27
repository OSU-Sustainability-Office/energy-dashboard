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
    allBuildingPromise: null
  }
}

const actions = {
  async loadBuilding (store, payload) {
    let buildingSpace = 'building_' + payload.id.toString()
    let moduleSpace = store.getters.path + '/' + buildingSpace
    this.registerModule(moduleSpace.split('/'), Building)
    store.commit(buildingSpace + '/path', moduleSpace)
    store.commit(buildingSpace + '/geoJSON', payload.geoJSON)
    store.commit(buildingSpace + '/mapId', payload.mapId)
    store.commit(buildingSpace + '/name', payload.name)
    store.commit(buildingSpace + '/group', payload.group)
    store.commit(buildingSpace + '/image', payload.image)
    store.commit(buildingSpace + '/id', payload.id)
    store.commit(buildingSpace + '/promise', Promise.resolve())
    for (let meterGroupId of payload.meterGroups) {
      await store.dispatch(buildingSpace + '/loadMeterGroup', { id: meterGroupId })
    }
    store.dispatch(buildingSpace + '/buildDefaultBlocks')
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
    let buildings = API.buildings()
    store.commit('promise', buildings)
    for (let building of store.getters.buildings()) {
      let buildingKey = building.path.split('/').pop()
      this.unregisterModule(buildingKey)
    }
    let buildingsResolved = await buildings
    let buildingPromises = []
    for (let building of buildingsResolved) {
      buildingPromises.push(store.dispatch('loadBuilding', building))
    }
    store.commit('allBuildingPromise', Promise.all(buildingPromises))
  }
}

const mutations = {
  promise (state, promise) {
    state.promise = promise
  },

  allBuildingPromise: (state, promise) => {
    state.allBuildingPromise = promise
  }
}

const getters = {
  path (state) {
    return state.path
  },

  promise (state) {
    return state.promise
  },

  building: (state) => (id) => {
    return state['building_' + id.toString()]
  },

  allBuildingPromise: (state) => {
    return state.allBuildingPromise
  },

  buildingGroups: (state) => {
    let groups = new Set()
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0) {
        groups.add(state[key].group)
      }
    }
    return groups
  },

  buildingsForGroup: (state) => (group) => {
    let buildings = []
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0 && state[key].group === group) {
        buildings.push(state[key])
      }
    }
    return buildings
  },

  buildings: (state) => () => {
    let buildings = []
    for (let key of Object.keys(state)) {
      if (key.search(/building_/) >= 0) {
        buildings.push(state[key])
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
