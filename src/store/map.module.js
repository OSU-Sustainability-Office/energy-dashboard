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
    console.log(store)
    let moduleSpace = ['map', payload.id.toString()]
    this.registerModule(moduleSpace, Building)
    store.commit(payload.id.toString() + '/geoJSON', payload.geoJSON)
    store.commit(payload.id.toString() + '/name', payload.name)
    store.commit(payload.id.toString() + '/group', payload.group)
    store.commit(payload.id.toString() + '/image', payload.image)
    store.commit(payload.id.toString() + '/id', payload.id)
    for (let meterGroupId of payload.meterGroups) {
      store.dispatch(payload.id.toString() + '/loadMeterGroup', { id: meterGroupId, base: moduleSpace })
    }
  },

  async loadMap (store) {
    for (let buildingId of Object.keys(this.state.map)) {
      this.unregisterModule('map/' + buildingId)
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
