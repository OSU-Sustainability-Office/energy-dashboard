/*
 * @Author: you@you.you
 * @Date:   Wednesday March 25th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday March 25th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
export default class CompareModifier {
  static name = 'building_compare'

  constructor (store, module) {
    /*
      Initialize the modifier here,
      this is only an example modifier that
      doed nothing. I expect the instance
      variables to be more descriptive for
      specific modifiers
    */
    this.data = {
      buildingIds: [],
      dataPromises: []
    }
  }

  async onAdd (store, module) {
    /*
      Function is called when a modifier
      is added to a block. Store is Vuex store
      module is block module.
    */
  }

  async onRemove (store, module) {
    /*
      Function is called when a modifier
      is removed from a block. Store is Vuex store
      module is block module.
    */
    await this.removeOldCharts(store, module, this.data.buildingIds)
  }

  async updateData (store, mod, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
    if (data.buildingIds) {
      await this.removeOldCharts(store, mod, this.data.buildingIds)
      this.data.buildingIds = data.buildingIds
      await this.addCharts(store, mod, this.data.buildingIds)
    }
  }

  async removeOldCharts (store, mod, ids) {
    for (let i in ids) {
      if (parseInt(i) !== 0) {
        let id = ids[i]
        await store.dispatch(mod.getters.path + '/unloadChart', id)
      }
    }
  }

  async addCharts (store, mod, ids) {
    let charts = []
    for (let i in ids) {
      // they ignore index of 0 here due to loadDefault function in block.module.js ("Total Electricity" default block),
      if (parseInt(i) !== 0) {
        let id = ids[i]
        let mgId = store.getters[store.getters['map/building'](id).path + '/primaryGroup']('Electricity').id
        charts.push({
          id: id,
          name: this.buildingName(store, id),
          point: 'accumulated_real',
          meters: mgId
        })
      }
    }
    // block.module.js loadCharts function is called here
    await store.dispatch(mod.getters.path + '/loadCharts', charts)
  }

  async preData (store, module, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
  }

  color (index, module) {
    return module.getters.chartColors[index]
  }

  buildingName (store, id) {
    return store.getters[store.getters['map/building'](id).path + '/name']
  }

  async postData (store, module, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
    if (this.data.buildingIds[0]) {
      data.datasets[0].label = this.buildingName(store, this.data.buildingIds[0])
    }
  }
}
