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
    buildingMap: new Map() // buildings with missing geoJSON (key: mapId, value: building)
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
    if (!payload.geoJSON && payload.mapId) {
      // if geoJSON is not provided, we need to fetch it
      store.commit('setBuildingInMap', { mapId: payload.mapId, building: store.state[buildingSpace] })
    }
    let mgPromises = []
    for (let meterGroup of payload.meterGroups) {
      mgPromises.push(store.dispatch(buildingSpace + '/loadMeterGroup', meterGroup))
    }
    await Promise.all(mgPromises)
    await store.dispatch(buildingSpace + '/buildDefaultBlocks')
  },

  async loadGeoJSONData (store, missingIds) {
    // fetch and parse the GeoJSON data
    const osmXML = await API.getGeoJSON(missingIds)
    const xmlDoc = new DOMParser().parseFromString(osmXML, 'text/xml')
    const geoJSON = Geo(xmlDoc)
    const buildingMap = store.getters.buildingMap

    if (geoJSON.features) {
      for (const feature of geoJSON.features) {
        const wayOrNode = String(feature.id.split('/')[0])
        if (wayOrNode !== 'way') {
          continue // Ignore node features
        }

        const wayId = String(feature.id.split('/')[1])
        const building = buildingMap.get(wayId)

        if (building) {
          // some buildings are Polygons by definition, but are returned as LineStrings
          // by OSM. This corrects the geometry type if necessary.
          if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates
            if (coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]) {
              feature.geometry.type = 'Polygon'
              feature.geometry.coordinates = [coords]
            }
          }

          // set the properties of the feature
          feature.properties = {
            id: building.id,
            group: building.group,
            name: building.name
          }

          // set the geoJSON data in the building module
          const buildingSpace = 'building_' + building.id.toString()
          store.commit(buildingSpace + '/geoJSON', feature)
        }
      }
    }
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

          // fetch missing geoJSON data (if any)
          const buildingMap = store.getters.buildingMap
          const missingIds = Array.from(buildingMap.keys()).join(',')
          if (missingIds.length > 0) {
            await store.dispatch('loadGeoJSONData', missingIds)
            buildingMap.clear() // clear the map to indicate that all missing geoJSON has been loaded
          }

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
  setBuildingInMap (state, { mapId, building }) {
    state.buildingMap.set(mapId, building)
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
  },

  buildingMap (state) {
    return state.buildingMap
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
