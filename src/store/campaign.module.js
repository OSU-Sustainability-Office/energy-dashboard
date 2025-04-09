/*
  Filename: campaign.module.js
  Info: Logical vuex-store instance of a campaign
*/

import Block from './block.module.js' // For building the blocks for this campaign

const state = () => {
  return {
    promise: null,
    path: null,
    id: null,
    name: null,
    dateStart: null,
    dateEnd: null,
    compareStart: null,
    compareEnd: null,
    media: null,
    meterGroupIDs: null
  }
}

/*
  Function to get the meter point based on the meter class.
  For Pacific Power meters, the point is baseline_perc_total.
  For all other meters, the point is baseline_percentage.
  This function is used to determine the point to be used for
  the baseline percentage calculation.
*/
function getMeterPoint (store, groupModule) {
  let point = 'baseline_percentage'

  // find Pacific Power meters
  for (const key in groupModule) {
    if (groupModule[key] && typeof groupModule[key] === 'object' && 'classInt' in groupModule[key]) {
      if (groupModule[key].classInt === 9990002) {
        point = 'baseline_perc_total'
      }
    }
  }

  return point
}

const actions = {
  async buildBlocks (store) {
    if (store.getters.promise === null) {
      store.commit(
        'promise',
        new Promise(async (resolve, reject) => {
          await this.getters['map/promise'] // Make sure building promises have been queued
          await this.getters['map/allBuildingPromise'] // Make sure buildings exist, this loads all MGs
          let defaultBlockSpace = 'block_default'
          let defaultModuleSpace = store.getters.path + '/' + defaultBlockSpace
          this.registerModule(defaultModuleSpace.split('/'), Block)
          store.commit(defaultBlockSpace + '/path', defaultModuleSpace)
          store.commit(defaultBlockSpace + '/shuffleChartColors')
          let charts = []
          let blockPromises = []
          for (let group of store.getters.meterGroupIDs) {
            let groupModule = this.getters['map/meterGroup'](group)
            if (groupModule) {
              charts.push({
                id: group,
                point: getMeterPoint(store, groupModule),
                name: this.getters[groupModule.building + '/name'],
                meters: group
              })
              blockPromises.push(
                new Promise(async (resolve, reject) => {
                  await groupModule.promise
                  const payload = {
                    id: group,
                    group: groupModule
                  }
                  let blockSpace = 'block_' + group.toString()
                  let moduleSpace = store.getters.path + '/' + blockSpace
                  this.registerModule(moduleSpace.split('/'), Block)
                  store.commit(blockSpace + '/path', moduleSpace)
                  await store.dispatch(blockSpace + '/loadDefault', payload)
                  store.commit(blockSpace + '/dateStart', store.getters.dateStart)
                  store.commit(blockSpace + '/dateEnd', store.getters.dateEnd)
                  store.commit(blockSpace + '/graphType', 2)
                  store.commit(blockSpace + '/name', this.getters[groupModule.building + '/name'])
                  await store.dispatch(blockSpace + '/addModifier', 'campaign_linebar')
                  await store.dispatch(blockSpace + '/updateModifier', {
                    name: 'campaign_linebar',
                    data: {
                      compareStart: store.getters.compareStart,
                      compareEnd: store.getters.compareEnd
                    }
                  })
                  resolve()
                })
              )
            }
          }
          await store.dispatch(defaultBlockSpace + '/loadCharts', charts)
          for (let chart of this.getters[defaultModuleSpace + '/charts']) {
            let oldModifierData = this.getters[chart.path + '/modifierData']
            this.commit(chart.path + '/modifierData', {
              ...oldModifierData,
              compareStart: store.getters.compareStart / 1000,
              compareEnd: store.getters.compareEnd / 1000
            })
          }
          await Promise.all(blockPromises)
          store.commit(defaultBlockSpace + '/dateInterval', 1)
          store.commit(defaultBlockSpace + '/intervalUnit', 'day')
          store.commit(defaultBlockSpace + '/graphType', 1)
          store.commit(defaultBlockSpace + '/dateStart', store.getters.dateStart)
          store.commit(defaultBlockSpace + '/dateEnd', store.getters.dateEnd)

          // I dont think this works exactly right
          store.commit(defaultBlockSpace + '/promise', Promise.resolve())
          const sortList = []
          const dataPromise = []
          for (let block of store.getters.blocks) {
            dataPromise.push(
              new Promise(async (resolve, reject) => {
                await this.dispatch(block.path + '/getData')
                sortList.push({
                  path: block.path,
                  value: this.getters[block.path + '/modifierData']('campaign_linebar').accumulatedPercentage
                })
                resolve()
              })
            )
          }
          await Promise.all(dataPromise)
          resolve()
        })
      )
    }
    return store.getters.promise
  }
}

const mutations = {
  promise: (state, promise) => {
    state.promise = promise
  },

  meterGroupIds: (state, groups) => {
    state.meterGroupIDs = groups
  },

  name: (state, name) => {
    state.name = name
  },

  id: (state, id) => {
    state.id = id
  },

  path: (state, path) => {
    state.path = path
  },

  dateStart: (state, dateStart) => {
    state.dateStart = dateStart
  },

  dateEnd: (state, dateEnd) => {
    state.dateEnd = dateEnd
  },

  compareStart: (state, compareStart) => {
    state.compareStart = compareStart
  },

  compareEnd: (state, compareEnd) => {
    state.compareEnd = compareEnd
  },

  media: (state, media) => {
    state.media = media
  }
}

const getters = {
  promise: state => {
    return state.promise
  },

  meterGroupIDs: state => {
    return state.meterGroupIDs
  },

  name: state => {
    return state.name
  },

  id: state => {
    return state.id
  },

  path: state => {
    return state.path
  },

  dateStart: state => {
    return state.dateStart
  },

  dateEnd: state => {
    let currentEpoch = new Date().getTime()
    currentEpoch = currentEpoch - (currentEpoch % (900 * 1000))
    if (state.dateEnd > currentEpoch) {
      return currentEpoch
    } else {
      return state.dateEnd
    }
  },

  compareStart: state => {
    return state.compareStart
  },

  compareEnd: state => {
    return state.compareEnd
  },

  media: state => {
    return state.media
  },

  blocks: state => {
    let blocks = []
    for (let key of Object.keys(state)) {
      if (key.search(/block_[0-9]+/) >= 0) {
        blocks.push(state[key])
      }
    }
    // if this is not copied adding removing elements will change the cached value
    // which is really bad
    return blocks
  },

  defaultBlock: state => {
    return state['block_default']
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
