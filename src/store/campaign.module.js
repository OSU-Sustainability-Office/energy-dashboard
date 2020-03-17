/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

import api from './api.js'
import Building from './building.module.js'

const state = () => {
  return {
    promises: [],
    path: null,
    id: null,
    name: null,
    date_start: null,
    date_end: null,
    compare_start: null,
    compare_end: null,
    buildings: [],
    media: null
  }
}

const actions = {

  // Waits for the VueX store to finish downloading building data.
  // Then, retrieves building data from the api and creates buildings that don't
  // already exist in VueX
  async loadBuilding(store, payload) { // Payload contains .buildingID
    // Create a promise for this building
    store.commit('addBuildingPromise', new Promise(async (resolve, reject) => {
      // Add the building's ID to the buildings array
      store.commit('addBuilding', payload.buildingID)

      // Wait for all buildings to finish loading
      await store.rootState['map']['promise']
      await store.rootState['map']['allBuildingPromise']

      // If the building doesn't exist, create the building in VueX
      if (store.rootState['map']['building_' + payload.buildingID.toString()] === undefined) {
        // Create the building in the VueX store (if it doesn't already exist)
        // Construct namespaces
        const buildingSpace = 'building_' + payload.buildingID.toString()
        const moduleSpace = 'map' + '/' + buildingSpace

        // Register the module - this prevents other async functions from creating the building
        this.registerModule(moduleSpace.split('/'), Building)

        // Make an API call to retrieve this building's data
        let building = api.getBuildingByID(payload.buildingID)
        let buildingResolved = (await building).data

        // Commit building data
        store.commit(moduleSpace + '/path', moduleSpace, { root: true })
        store.commit(moduleSpace + '/geoJSON', buildingResolved.geoJSON, { root: true })
        store.commit(moduleSpace + '/mapId', buildingResolved.mapId, { root: true })
        store.commit(moduleSpace + '/name', buildingResolved.name, { root: true })
        store.commit(moduleSpace + '/group', buildingResolved.group, { root: true })
        store.commit(moduleSpace + '/image', buildingResolved.image, { root: true })
        store.commit(moduleSpace + '/id', buildingResolved.id, { root: true })
        store.commit(moduleSpace + '/promise', Promise.resolve(), { root: true })
        for (let meterGroupId of buildingResolved.meterGroups) {
          store.dispatch(moduleSpace + '/loadMeterGroup', { id: meterGroupId }, { root: true })
        }
        store.dispatch(moduleSpace + '/buildDefaultBlocks', {}, { root: true })
      }
      resolve(payload.buildingID)
    }))
  }
}

const mutations = {
  addBuildingPromise (state, promise) {
    state.promises.push(promise)
  },

  name (state, name) {
    state.name = name
  },

  id (state, id) {
    state.id = id
  },

  path (state, path) {
    state.path = path
  },

  date_start (state, date_start) {
    state.date_start = date_start
  },

  date_end (state, date_end) {
    state.date_end = date_end
  },

  compare_start (state, compare_start) {
    state.compare_start = compare_start
  },

  compare_end (state, compare_end) {
    state.compare_end = compare_end
  },

  media (state, media) {
    state.media = media
  },

  async addBuilding (state, buildingID) {
    // Add to building ID list
    state.buildings.push(buildingID)
  }

}

const getters = {
  promises (state) {
    return state.promises
  },

  name (state) {
    return state.name
  },

  id (state) {
    return state.id
  },

  path (state) {
    return state.path
  },

  date_start (state) {
    return state.date_start
  },

  date_end (state) {
    return state.date_end
  },

  compare_start (state) {
    return state.compare_start
  },

  compare_end (state) {
    return state.compare_end
  },

  media (state) {
    return state.media
  },

  getAllData (state) {
    return state
  },

  buildings (state) {
    return state.buildings
  }

}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
