/**
  Filename: base.mod.js
  Description: Base class for block modifiers (boilerplate).
*/

export default class BaseBlockModifier {
  static name = 'base'

  constructor (store, module) {
    /*
      Initialize the modifier here,
      this is only an example modifier that
      doed nothing. I expect the instance
      variables to be more descriptive for
      specific modifiers
    */
    this.data = {}
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

  async preData (store, module) {}

  async postData (store, module, payload) {}
}
