/**
  Filename: store/index.js
  Info: This is the entry-point for the Vuex store.
        All our API data is stored here and handled by their
        respective modules.
*/
import { createStore } from 'vuex'
import Campaigns from './campaigns.module.js'
import EDMap from './map.module.js'
import ModalController from './modal_controller.module.js'
import DataStore from './data_layer/data_store.js'

const store = createStore({
  getters: {
    view: state => {
      return state['view']
    }
  },
  modules: {
    campaigns: Campaigns,
    map: EDMap,
    modalController: ModalController,
    dataStore: DataStore
  }
})

export default store
