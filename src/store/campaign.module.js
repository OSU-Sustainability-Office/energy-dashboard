/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

import api from './api.js'
import Building from './building.module.js' // For creating buildings in VueX
import Block from './block.module.js' // For building the blocks for this campaign
import Chart from './chart.module.js' // Used during the block building process

const state = () => {
  return {
    promises: [],
    blockPromises: [],
    path: null,
    id: null,
    name: null,
    date_start: null,
    date_end: null,
    compare_start: null,
    compare_end: null,
    buildings: [],
    blocks: [],
    media: null,
    meterGroupIDs: []
  }
}

const actions = {

  // Waits for the VueX store to finish downloading building data.
  // Then, retrieves building data from the api and creates buildings that don't
  // already exist in VueX
  async loadBuilding(store, payload) { // Payload contains .buildingID
    // Crea
  // The blocks contain the charts for each campaign
  // This function builds blocks in the VueX store for the campaign. These include:
  //      - 1 Block for each building
  //      - 1 Block which has data for all buildings in the contest
  // Payload is emptyte a promise for this building
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
        store.commit(moduleSpace + '/path', moduleSpace, {
          root: true
        })
        store.commit(moduleSpace + '/geoJSON', buildingResolved.geoJSON, {
          root: true
        })
        store.commit(moduleSpace + '/mapId', buildingResolved.mapId, {
          root: true
        })
        store.commit(moduleSpace + '/name', buildingResolved.name, {
          root: true
        })
        store.commit(moduleSpace + '/group', buildingResolved.group, {
          root: true
        })
        store.commit(moduleSpace + '/image', buildingResolved.image, {
          root: true
        })
        store.commit(moduleSpace + '/id', buildingResolved.id, {
          root: true
        })
        store.commit(moduleSpace + '/promise', Promise.resolve(), {
          root: true
        })
        for (let meterGroupId of buildingResolved.meterGroups) {
          store.dispatch(moduleSpace + '/loadMeterGroup', {
            id: meterGroupId
          }, {
            root: true
          })
        }
      }
      resolve(payload.buildingID)
    }))
  },

  // The blocks contain the charts for each campaign
  // This function builds blocks in the VueX store for the campaign. These include:
  //      - 1 Block for each building
  //      - 1 Block which has data for all buildings in the contest
  // Payload is empty
  async buildBlocks(store, payload) {
    store.commit('addBlockPromise', new Promise(async (resolve, reject) => {
      // Build 3 charts for each building
      //      1. 15 minute interval data for the previous 6 hours
      //      2. Hourly interval data for the previous 24 hours
      //      3. Daily interval data for the previous n days (depending on the current date and the length of the competition)
      store.getters['buildings'].forEach(async (buildingID, index) => {
        // Calculate epoch times
        const endCompetitionEpoch = new Date(store.getters.date_end).getTime()
        const currentEpoch = new Date().getTime()

        // Retrieve the building data
        await Promise.all(store.state['promises'])
        let building = store.rootState['map']['building_' + buildingID.toString()]

        // Retrieve paths to all of the meter groups for the current building
        const meterGroupPath = building.path + '/meterGroup_' + store.getters['meterGroupIDs'][index]

        // Iterate over each interval and build the blocks
        const intervals = ['minute', 'hour', 'day']
        intervals.forEach(interval => {
          if(store.state['block_' + interval + '_' + buildingID] == undefined) {
            store.dispatch('createBlock', {
              blockName: interval + '_' + buildingID,
              intervalUnit: interval,
              name: building.name,
              dateInterval: 1,
              graphType: 5,
              dateStart: new Date(store.getters.date_start).getTime(),
              dateEnd: endCompetitionEpoch > currentEpoch ? currentEpoch : endCompetitionEpoch,
              charts: [
                // line chart with baseline data
                {
                  id: 1,
                  name: 'Baseline Data',
                  point: 'accumulated_real',
                  meterGroupPath: meterGroupPath,
                  building: building.path
                },
                // bar chart with current data
                {
                  id: 2,
                  name: 'Current Data',
                  point: 'accumulated_real',
                  meterGroupPath: meterGroupPath,
                  building: building.path
                }
              ]
            })
          }
        })
      })
    }))
  },

  // Creates one block that matches the specifications outlined in payload
  // payload contains:
  //      blockName - Used for generating the block's path
  //      intervalUnit - minute, hour, or day - specifies what type of interval data to display on the graph
  //      name - id/name used for the block's path
  //      dateInterval - An integer, it is the number that forms the interval that your interval unit is (15 + minute = 15 minute, 2 + hour = 2 hours etc)
  //      graphType - An integer (1: Line, 2: Bar, 3: Doughnut, 4: Piechart, 5: LineBar)
  //      dateStart - Epoch time
  //      dateEnd - Epoch time
  //      charts - array of data for creating multiple charts in this block
  //        a chart object contains
  //             id - used to create the chart's path
  //             name - a name for the chart
  //             point - which metering point to display
  //             meterGroupPath (vuex path) - metergroup used for retrieving the data
  //             building (vuex path) - a reference to the building this data belongs to
  async createBlock(store, payload) {
    store.commit('addBlockPromise', new Promise(async (resolve, reject) => {
      // Compute the block's path
      let blockSpace = 'block_' + payload.blockName
      let moduleSpace = store.getters.path + '/' + blockSpace

      store.commit('addBlock', store.state['/' + blockSpace]) // Commit the block's path to the array of blocks

      // Register a new block module
      this.registerModule(moduleSpace.split('/'), Block)
      store.commit(blockSpace + '/path', moduleSpace)

      // Manually create the block
      store.commit(blockSpace + '/intervalUnit', payload.intervalUnit)
      store.commit(blockSpace + '/name', payload.name)
      store.commit(blockSpace + '/dateInterval', payload.dateInterval)
      store.commit(blockSpace + '/graphType', payload.graphType)
      store.commit(blockSpace + '/dateStart', payload.dateStart)
      store.commit(blockSpace + '/dateEnd', payload.dateEnd)

      // Create the charts
      payload.charts.forEach(async chart => {
        chart['blockSpace'] = blockSpace
        chart['moduleSpace'] = moduleSpace
        store.dispatch('createChart', chart)
      })
      store.dispatch(blockSpace + '/getData') // Download the chart data
      resolve()
    }))
  },

  // Creates one block that matches the specifications outlined in payload
  // payload contains:
  //      blockSpace - the parent block's vuex path
  //      moduleSpace - the parent block's module space
  //      name - a name for the chart
  //      point - which metering point to display
  //      meter (vuex path) - metergroup used for retrieving the data
  //      building (vuex path) - a reference to the building this data belongs to
  async createChart(store, payload) {
    // We add chart promises to the block promise list for convenience
    store.commit('addBlockPromise', new Promise(async (resolve, reject) => {
      // Compute the block's path
      let chartSpace = 'chart_' + payload.id
      let moduleSpace = payload.moduleSpace + '/' + chartSpace

      // Register a new chart module
      this.registerModule(moduleSpace.split('/'), Chart)
      store.commit(payload.blockSpace + '/' + chartSpace + '/path', moduleSpace)

      // Manually create the chart
      store.commit(payload.blockSpace + '/' + chartSpace + '/name', payload.name)
      store.commit(payload.blockSpace + '/' + chartSpace + '/point', payload.point)
      store.commit(payload.blockSpace + '/' + chartSpace + '/color', payload.color)
      store.commit(payload.blockSpace + '/' + chartSpace + '/meterGroupPath', payload.meterGroupPath)
      resolve()
    }))
  }
}

const mutations = {
  addBuildingPromise(state, promise) {
    state.promises.push(promise)
  },

  addBlockPromise(state, promise) {
    state.blockPromises.push(promise)
  },

  name(state, name) {
    state.name = name
  },

  id(state, id) {
    state.id = id
  },

  path(state, path) {
    state.path = path
  },

  date_start(state, date_start) {
    state.date_start = date_start
  },

  date_end(state, date_end) {
    state.date_end = date_end
  },

  compare_start(state, compare_start) {
    state.compare_start = compare_start
  },

  compare_end(state, compare_end) {
    state.compare_end = compare_end
  },

  media(state, media) {
    state.media = media
  },

  meterGroupIDs(state, meterGroupIDs) {
    state.meterGroupIDs = meterGroupIDs
  },

  async addBuilding(state, buildingID) {
    // Add to building ID list
    state.buildings.push(buildingID)
  },

  addBlock(state, block) {
    state.blocks.push(block)
  }

}

const getters = {
  promises(state) {
    return state.promises
  },

  blockPromises(state) {
    return state.blockPromises
  },

  name(state) {
    return state.name
  },

  meterGroupIDs(state) {
    return state.meterGroupIDs
  },

  id(state) {
    return state.id
  },

  path(state) {
    return state.path
  },

  date_start(state) {
    return state.date_start
  },

  date_end(state) {
    return state.date_end
  },

  compare_start(state) {
    return state.compare_start
  },

  compare_end(state) {
    return state.compare_end
  },

  media(state) {
    return state.media
  },

  getAllData(state) {
    return state
  },

  buildings(state) {
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
