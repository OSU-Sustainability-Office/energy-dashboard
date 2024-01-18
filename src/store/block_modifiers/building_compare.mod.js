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

  // I *think* updateModifier function from block.module.js lands here, not sure.
  // updateData function below calls addCharts and removeOldCharts
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
    // If we change the chartspace / chart id to support duplicate charts of the same building, we need to update this function
    // E.g. if we make the chartspace from chart_<number> to chart_<number>_<another number>, the function below needs to support
    // new syntax

    // Also, see updateData function right above this, as well as view.vue line 90ish for call order

    // Also, see block.module's unloadChart (this function calls unloadChart)
    // Consider moving await out of for loop
    for (let i in ids) {
      if (parseInt(i) !== 0) {
        let id = ids[i]
        await store.dispatch(mod.getters.path + '/unloadChart', id)
      }
    }
  }

  async addCharts (store, mod, ids) {
    // where adding new charts for comparison is handled. Either here or maybe in view.vue we need to rework
    // to handle multiple charts of the same building via different chartname or something
    let charts = []
    for (let i in ids) {
      // they ignore index of 0 here due to loadDefault function in block.module.js ("Total Electricity" default block),
      // which is called every time in addition to whatever is in loadCharts function of block.module.js (all charts in
      // comparison after the first one)
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
    // 12/23/2023 EDIT: The below commented out code as is will throw errors, as one building with multiple time periods
    // means that this.datasets and this.data.buildingIDs will be different lengths.
    // Need to handle: multiple buildings same timestamps, one building multiple timestamps, one building same timestamps
    // Need to add: energy labels (e.g. "Net Energy"), timestamp labels (Date X to Date Y)
    // For energy labels, you can alter chart.module's chartData object in getData(), to change what is sent to data.datatsets
    // For timestamp labels, to convert Unix timestamp to English, see chartController toDateString()
    // Also don't know why block.module.js's loadDefault uses "Total Electricity", which is the same thing as
    // "Net Energy", but named different.
    /*
   for (let i = 0; i < data.datasets.length;) {
    if (this.data.buildingIds[i]) {
      data.datasets[i].label = this.buildingName(store, this.data.buildingIds[i])
      i += 1
    }
  }
  */
  }
}
