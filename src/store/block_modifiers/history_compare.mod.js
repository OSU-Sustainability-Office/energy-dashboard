/*
 * Filename: history_compare.mod.js
 * Info: Block modifier for historic comparisons.
 *       This is intended for annual comparisons, comparing data
 *       from a time period in 1 year, to a period in another year.
 *
 *        Basically this modifier should add older dataset to
 *        the chart dataset of interest.
 */
export default class BaseBlockModifier {
  static name = 'base'

  constructor (store, module) {
    this.data = {
      buildingId: 0,
      priorYears: 1 // Number of previous intervals to compare
    }
  }

  async onAdd (store, module) {
    /*
      Function is called when a modifier
      is added to a block. Store is Vuex store
      module is block module.
    */
    // TODO: Grab
  }

  async onRemove (store, module) {
    /*
      Function is called when a modifier
      is removed from a block. Store is Vuex store
      module is block module.
    */
  }

  async updateData (store, module, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is modification message.
      Modification message different for all modifiers.
      Implementation is left as an excericise for the
      modifier developer.
    */
  }

  async preData (store, module) {

  }

  async postData (store, module, payload) {

  }
}
