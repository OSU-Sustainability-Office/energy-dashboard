/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-13T17:14:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-20T15:51:39-08:00
 */

import Vue from 'vue'
import Vuex from 'vuex'
import View from './view.module.js'
import User from './user.module.js'
import EDMap from './map.module.js'
import ModalController from './modal_controller.module.js'

Vue.use(Vuex)

const store = {
  getters: {
    view: (state) => {
      return state['view']
    }
  },

  modules: {
    view: View,
    // campaign: Campaign,
    map: EDMap,
    user: User,
    modalController: ModalController
  }
}

export default new Vuex.Store(store)
