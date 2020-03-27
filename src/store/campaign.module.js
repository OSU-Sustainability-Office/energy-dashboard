/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

// import API from './api.js'
// import Building from './building.module.js' // For creating buildings in VueX
import Block from './block.module.js' // For building the blocks for this campaign
// import Chart from './chart.module.js' // Used during the block building process

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
    media: null
  }
}

const actions = {
  async buildBlocks (store, meterGroups) {
    if (store.getters.promise === null) {
      store.commit('promise', new Promise(async (resolve, reject) => {
        await this.getters['map/promise'] // Make sure building promises have been queued
        await this.getters['map/allBuildingPromise'] // Make sure buildings exist, this loads all MGs
        let defaultBlockSpace = 'block_default'
        let defaultModuleSpace = (store.getters.path + '/' + defaultBlockSpace)
        this.registerModule(defaultModuleSpace.split('/'), Block)
        store.commit(defaultBlockSpace + '/path', defaultModuleSpace)
        store.commit(defaultBlockSpace + '/shuffleChartColors')

        let charts = []
        let blockPromises = []
        for (let group of meterGroups) {
          let groupModule = this.getters['map/meterGroup'](group)
          if (groupModule) {
            charts.push({
              id: group,
              point: 'baseline_percentage',
              name: this.getters[groupModule.building + '/name'],
              meters: group
            })
            blockPromises.push(new Promise(async (resolve, reject) => {
              await groupModule.promise
              const payload = {
                id: group,
                group: groupModule
              }
              let blockSpace = 'block_' + group.toString()
              let moduleSpace = (store.getters.path + '/' + blockSpace)
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
            }))
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
        const sortList = []
        for (let block of store.getters.blocks) {
          await this.dispatch(block.path + '/getData')
          sortList.push({ path: block.path, value: this.getters[block.path + '/modifierData']('campaign_linebar').accumulatedPercentage })
        }
        sortList.sort((a, b) => (a.value > b.value) ? 1 : -1)
        for (let i = 0; i < 3; i++) {
          if (i >= sortList.length) break
          this.dispatch(sortList[i].path + '/updateModifier', {
            name: 'campaign_linebar',
            data: {
              rank: i
            }
          })
        }
        resolve()
      }))
    }
    return store.getters.promise
  }
}

const mutations = {
  promise: (state, promise) => {
    state.promise = promise
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
  promise: (state) => {
    return state.promise
  },

  name: (state) => {
    return state.name
  },

  id: (state) => {
    return state.id
  },

  path: (state) => {
    return state.path
  },

  dateStart: (state) => {
    return state.dateStart
  },

  dateEnd: (state) => {
    let currentEpoch = ((new Date()).getTime())
    currentEpoch = currentEpoch - (currentEpoch % (900 * 1000))
    if (state.dateEnd > currentEpoch) {
      return currentEpoch
    } else {
      return state.dateEnd
    }
  },

  compareStart: (state) => {
    return state.compareStart
  },

  compareEnd: (state) => {
    return state.compareEnd
  },

  media: (state) => {
    return state.media
  },

  blocks: (state) => {
    let blocks = []
    for (let key of Object.keys(state)) {
      if (key.search(/block_[0-9]+/) >= 0) {
        blocks.push(state[key])
      }
    }
    return blocks
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
