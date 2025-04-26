/**
  Filename: map.module.js
  Info: "Map" module handles map-geometry data and dynamically loads all the building modules.
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
      store.commit(
        'jsonPromise',
        new Promise(async (resolve, reject) => {
          await store.getters.promise

          // Fetch Building Geometry from Overpass if it exists
          const buildings = store.getters.buildings.filter(b => b.mapId)
          const IDs = buildings.map(b => b.mapId).join(',')
          const geometryOSM = await API.buildingFeature(IDs)
          const buildingParser = new DOMParser()
          const buildingData = buildingParser.parseFromString(geometryOSM, 'text/xml')
          const JSON = Geo(buildingData)

          // Setup dictionary
          const ways = new Map()
          for (let feature of JSON.features) {
            if (feature.id.includes('way')) {
              // Convert LineString to Polygon if it is a closed shape
              if (feature.geometry.type === 'LineString') {
                const coords = feature.geometry.coordinates
                if (coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]) {
                  feature.geometry.type = 'Polygon'
                  feature.geometry.coordinates = [coords]
                }
              }
              ways.set(feature.id, feature)
            }
          }

          // Commit GeoJSON to each building module
          for (let building of buildings) {
            let way = ways.get(`way/${building.mapId}`)
            if (way) {
              way.properties.id = building.id
              way.properties.group = building.group
              this.commit(building.path + '/geoJSON', way)
            }
          }

          resolve()
        })
      )
    }
    return store.getters.jsonPromise
  },

  async boundedWays (store, payload) {
    let features = await API.boundedFeatures(payload)
    let parser = new DOMParser()
    let xmlData = parser.parseFromString(features, 'text/xml')
    let geojson = Geo(xmlData)
    let ways = geojson.features.filter(feature => feature.id.search(/way\/[0-9]+/) >= 0 && feature.properties.building)
    let promises = []
    for (let way of ways) {
      promises.push(store.dispatch('buildingJSON', way.id.replace('way/', '')))
    }
    return Promise.all(promises)
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
