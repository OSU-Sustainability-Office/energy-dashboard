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
    allBuildingPromise: null,
    buildingMap: new Map(), // buildings with missing geoJSON (key: mapId, value: buildingId)
    buildingSeeds: {} // payload fragments used for deferred building hydration
  }
}

const actions = {
  loadBuildingBase(store, payload) {
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
    store.commit(buildingSpace + '/hydrated', false)

    // Build a lightweight description from the seed payload so filtering works before hydration.
    const utilityTypes = new Set()
    for (let meterGroup of payload.meterGroups || []) {
      if (meterGroup.meters && meterGroup.meters.length > 0 && meterGroup.meters[0].type) {
        utilityTypes.add(meterGroup.meters[0].type)
      }
    }
    for (let utilityType of utilityTypes) {
      store.commit(buildingSpace + '/addType', utilityType)
    }

    if (payload.geoJSON) {
      let parsedGeoJSON = payload.geoJSON
      if (typeof payload.geoJSON === 'string') {
        try {
          parsedGeoJSON = JSON.parse(payload.geoJSON)
        } catch (err) {
          parsedGeoJSON = null
        }
      }
      if (parsedGeoJSON) {
        store.commit(buildingSpace + '/geoJSON', parsedGeoJSON)
      }
    }

    store.commit('buildingSeed', {
      id: payload.id,
      meterGroups: payload.meterGroups || []
    })

    if (!payload.geoJSON && payload.mapId) {
      // if geoJSON is not provided, we need to fetch it
      store.commit('setBuildingInMap', { mapId: payload.mapId, buildingId: payload.id })
    }
  },

  async hydrateBuilding(store, buildingId) {
    const building = store.getters.building(buildingId)
    if (!building) {
      return null
    }

    if (building.hydrated) {
      return building
    }

    if (building.hydratePromise) {
      await building.hydratePromise
      return store.getters.building(buildingId)
    }

    const buildingSpace = 'building_' + buildingId.toString()
    const meterGroups = store.getters.buildingSeed(buildingId)

    const hydratePromise = (async () => {
      let mgPromises = []
      for (let meterGroup of meterGroups) {
        mgPromises.push(store.dispatch(buildingSpace + '/loadMeterGroup', meterGroup))
      }
      await Promise.all(mgPromises)
      await store.dispatch(buildingSpace + '/buildDefaultBlocks')
      store.commit(buildingSpace + '/hydrated', true)
    })()

    store.commit(buildingSpace + '/promise', hydratePromise)
    store.commit(buildingSpace + '/hydratePromise', hydratePromise)

    try {
      await hydratePromise
    } catch (err) {
      store.commit(buildingSpace + '/hydratePromise', null)
      store.commit(buildingSpace + '/promise', null)
      throw err
    }

    return store.getters.building(buildingId)
  },

  async hydrateAllBuildings(store) {
    if (store.getters.allBuildingPromise === null) {
      const allBuildingPromise = (async () => {
        await store.dispatch('loadMap')
        const buildingIds = store.getters.buildings.map(building => building.id)
        await Promise.all(buildingIds.map(id => store.dispatch('hydrateBuilding', id)))
      })()
      store.commit('allBuildingPromise', allBuildingPromise)
    }
    try {
      return await store.getters.allBuildingPromise
    } catch (err) {
      store.commit('allBuildingPromise', null)
      throw err
    }
  },

  async loadGeoJSONData(store, missingIds) {
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
        const buildingId = buildingMap.get(wayId)
        const building = store.getters.building(buildingId)

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

  async loadMap(store) {
    if (store.getters.promise === null) {
      const mapPromise = (async () => {
        let buildingsResolved = await API.buildings()
        for (let building of buildingsResolved) {
          await store.dispatch('loadBuildingBase', building)
        }

        // fetch missing geoJSON data (if any)
        const buildingMap = store.getters.buildingMap
        const missingIds = Array.from(buildingMap.keys()).join(',')
        if (missingIds.length > 0) {
          await store.dispatch('loadGeoJSONData', missingIds)
          buildingMap.clear() // clear the map to indicate that all missing geoJSON has been loaded
        }
      })()
      store.commit('promise', mapPromise)
    }
    try {
      return await store.getters.promise
    } catch (err) {
      store.commit('promise', null)
      throw err
    }
  }
}

const mutations = {
  promise(state, promise) {
    state.promise = promise
  },
  allBuildingPromise(state, promise) {
    state.allBuildingPromise = promise
  },
  setBuildingInMap(state, { mapId, buildingId }) {
    state.buildingMap.set(mapId, buildingId)
  },
  buildingSeed(state, { id, meterGroups }) {
    state.buildingSeeds[id] = meterGroups
  }
}

const getters = {
  path(state) {
    return state.path
  },

  promise(state) {
    return state.promise
  },

  allBuildingPromise(state) {
    return state.allBuildingPromise
  },

  buildingSeed: state => id => {
    return state.buildingSeeds[id] || []
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
          if (buildingKey.search(/meterGroup_/) >= 0) {
            meterGroups[buildingKey.replace('meterGroup_', '')] = state[key][buildingKey]
          }
        }
      }
    }
    return meterGroups[id]
  },

  buildingMap(state) {
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
