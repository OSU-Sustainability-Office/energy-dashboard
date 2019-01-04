/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-13T17:14:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-20T15:51:39-08:00
 */

import Vue from 'vue'
import Vuex from 'vuex'

import createStoreConfig from './storeconfig.js'

Vue.use(Vuex)

export default new Vuex.Store(createStoreConfig())
