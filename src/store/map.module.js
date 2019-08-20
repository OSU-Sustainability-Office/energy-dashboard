/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Building from './building.module.js'

const state = () => {
  return {
  }
}

const actions = {
  async loadBuilding (store, payload) {
    let moduleSpace = ['map', payload.id.toString()]
    this.registerModule(moduleSpace, Building)
    store.commit(payload.id.toString() + '/path', store.getters.path + '/' + payload.id.toString())
    store.commit(payload.id.toString() + '/geoJSON', payload.geoJSON)
    store.commit(payload.id.toString() + '/name', payload.name)
    store.commit(payload.id.toString() + '/group', payload.group)
    store.commit(payload.id.toString() + '/image', payload.image)
    store.commit(payload.id.toString() + '/id', payload.id)
    let groupPromises = []
    for (let meterGroupId of payload.meterGroups) {
      groupPromises.push(store.dispatch(payload.id.toString() + '/loadMeterGroup', { id: meterGroupId, base: moduleSpace }))
    }
    await Promise.all(groupPromises)
    await store.dispatch(payload.id.toString() + '/buildDefaultBlocks', { base: moduleSpace })
  },

  async loadMap (store) {
    for (let buildingId of Object.keys(this.state.map)) {
      if (buildingId !== 'path') {
        this.unregisterModule('map/' + buildingId)
      }
    }
    let buildings = await API.buildings()
    for (let building of buildings) {
      store.dispatch('loadBuilding', building)
    }
  }
}

const mutations = {

}

const getters = {
  building: (state) => (id) => {
    return state[id]
  },

  path: () => {
    return 'map'
  },

  // buildings: (state) => {
  //   return Object.keys(state).reduce((r, c) => {
  //     if (c !== 'path') {
  //       r.push(state[c])
  //     }
  //   }, [])
  // },

  meterGroup: (state) => (id) => {
    return Object.values(state).map(building => building.getters.meterGroups).reduce((meterGroupsObject, meterGroups, index) => {
      for (let group of meterGroups) {
        meterGroupsObject[group.getters.id] = group
      }
    }, {})[id]
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
