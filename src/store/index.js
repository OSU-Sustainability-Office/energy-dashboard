/**
  Filename: index.js
  Info: This is the entry-point for the Vuex store.
        All our API data is stored here and handled by their
        respective modules.
*/
import View from './view.module.js';
import User from './user.module.js';
import Campaigns from './campaigns.module.js';
import EDMap from './map.module.js';
import ModalController from './modal_controller.module.js';
import Admin from './admin.module.js';
import DataStore from './data_layer/data_store.js';

const StoreConfig = {
  getters: {
    view: state => {
      return state['view'];
    },
  },

  modules: {
    view: View,
    admin: Admin,
    campaigns: Campaigns,
    map: EDMap,
    user: User,
    modalController: ModalController,
    dataStore: DataStore,
  },
};

export default StoreConfig;
