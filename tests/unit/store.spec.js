/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T14:36:18-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by: Milan Donhowe
 * @Last modified time: 4/13/2021
 * @Description: This file describes unit tests for the Vuex store & its modules.
 *               The way it fundamentally works is by creating a dummy-vue instance
 *               along with a copy of the Vuex store and then testss the code output
 *               against mock data (data we store locally which imitates the structure of
 *               data we expect to appear during the real program runtime).
 */
const axios = require('axios')
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

// jest.mock essentially redirects any axios calls
// to some empty functions whose behavior we can define
// in the unit tests.  This is because we don't want to
// *actually query* the API during a test.
jest.mock('axios')


// import the vuex store configuration object
import { StoreConfig } from '@/store/index'

// Also import all the store modules (needed for cloneDeep)
import View from '@/store/view.module.js'
import User from '@/store/user.module.js'
import Campaigns from '@/store/campaigns.module.js'
import EDMap from '@/store/map.module.js'
import ModalController from '@/store/modal_controller.module.js'
import Admin from '@/store/admin.module.js'
import DataStore from '@/store/data_layer/data_store.js'


describe('Testing Vuex Store Modules', () => {
    
    // Create local deep-copy of Vue & Vuex instances
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const localStore = new Vuex.Store(cloneDeep({...StoreConfig, modules: {
      view: View,
      admin: Admin,
      campaigns: Campaigns,
      map: EDMap,
      user: User,
      modalController: ModalController,
      dataStore: DataStore
    }}))
  
    describe('Testing Data Store Module', () => {

        it('Testing Remote System Now',  async () => {
          const mockTime = Date.now().toString()
          axios.mockResolvedValue( { data: mockTime } )

          await localStore.dispatch('dataStore/loadSystemNow')

          return expect(localStore.getters['dataStore/SystemNow']).toBe(Number(mockTime))
        })

    })

    // TODO: add more unit tests for other modules!
})
