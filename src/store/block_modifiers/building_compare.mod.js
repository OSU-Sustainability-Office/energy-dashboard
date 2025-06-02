/**
 * Filename: building_compare.mod.js
 * Description: Defines the CompareModifier class, which is used as a Vuex store modifier
 * for comparing multiple building data simultaneously. The modifier handles adding, removing,
 * and updating charts for specific building IDs, as well as managing associated data.
 */
export default class CompareModifier {
  static name = 'building_compare'

  constructor(store, module) {
    this.data = {
      buildingIds: [], // Array of building IDs to compare
      dataPromises: []
    }
  }

  /*
    Function is called when a modifier
    is added to a block. Store is Vuex store
    module is block module.
  */
  async onAdd(store, module) {
    // Required to load comparison chart - No additional logic needed
  }

  /*
    Function is called when a modifier
    is removed from a block. Store is Vuex store
    module is block module.
  */
  async onRemove(store, module) {
    await this.removeOldCharts(store, module, this.data.buildingIds)
  }

  /*
    Function is called when a block
    updates modifier data. Store is Vuex store
    module is block module, data is new incoming
    data.
  */
  async updateData(store, mod, data) {
    if (data.buildingIds) {
      await this.removeOldCharts(store, mod, this.data.buildingIds)
      this.data.buildingIds = data.buildingIds
      await this.addCharts(store, mod, this.data.buildingIds)
    }
  }

  // Helper function to remove old charts from the store
  async removeOldCharts(store, mod, ids) {
    for (let i in ids) {
      if (parseInt(i) !== 0) {
        let id = ids[i]
        await store.dispatch(mod.getters.path + '/unloadChart', id)
      }
    }
  }

  // Helper function to add new charts to the store
  async addCharts(store, mod, ids) {
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

  /*
    Function is called when a block
    updates modifier data. Store is Vuex store
    module is block module, data is new incoming
    data.
  */
  async preData(store, module, data) {
    // Required to load comparison chart - No additional logic needed
  }

  buildingName(store, id) {
    return store.getters[store.getters['map/building'](id).path + '/name']
  }

  /*
    Function is called when a block
    updates modifier data. Store is Vuex store
    module is block module, data is new incoming
    data.
  */
  async postData(store, module, data) {
    if (this.data.buildingIds[0]) {
      data.datasets[0].label = this.buildingName(store, this.data.buildingIds[0])
    }
  }
}
