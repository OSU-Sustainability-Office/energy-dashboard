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

// Mock API Data
import mockMeterReadings from "../assertedData/mock_meter_data.json"
import mockAllBuildings from "../assertedData/mock_allbuildings.json"

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
          axios.mockResolvedValue({ data: mockTime })

          await localStore.dispatch('dataStore/loadSystemNow')

          return expect(localStore.getters['dataStore/SystemNow']).toBe(Number(mockTime))
        })

        
        it('Testing API Query', async () => {
          axios.mockResolvedValue({ data: mockMeterReadings })

          const payload = {
            meterId: 5,
            start: 1613232900,
            end: 1618504200,
            uom: 'accumulated_real'
          }
          
          const formattedData = await localStore.dispatch('dataStore/getData', payload);
          // make sure we recieved the expected number of responses
          expect(formattedData.length).toEqual(mockMeterReadings.length)
        })

    })
    
    describe('Testing Map Module...', () => {

      it('Calling Load Map...', async () => {
        // we have 32 buildings in our mock-data
        axios.mockResolvedValue({data: mockAllBuildings})

        // This single action loads all the buildings, meter groups & meter modules.
        await localStore.dispatch('map/loadMap')

        // See if this correctly setup the Building modules
        for (let building of mockAllBuildings){
          let buildingModulePath = 'map/building_' + building.id.toString()
          // Check that the building object got loaded correctly
          for (let attribute of Object.keys(building)){
            if (attribute !== 'meterGroups'){
              expect(localStore.getters[buildingModulePath + `/${attribute}`]).toEqual(building[attribute])
            }
          }

          for (let MeterGroup of building.meterGroups){
            let MeterGroupModulePath = buildingModulePath + '/meterGroup_' + MeterGroup.id.toString()

            // Check that the Meter Groups got loaded correctly
            for (let attribute of Object.keys(MeterGroup)){
              if (attribute !== 'meters'){
                expect(localStore.getters[MeterGroupModulePath + `/${attribute}`]).toEqual(MeterGroup[attribute])
              }
            }

            for (let Meter of MeterGroup.meters){
              let MeterModulePath = MeterGroupModulePath + '/meter_' + Meter.id.toString()

              // Finally, check that the Meter module got loaded correctly
              for (let attribute of Object.keys(Meter)){
                expect(localStore.getters[MeterModulePath + `/${attribute}`]).toEqual(Meter[attribute])
              }

            }
          }
        }
      })
      // TODO: add load JSON test

    })

    /*TODO: add test for Modal controller */

    /*TODO: add test for Chart Module */

    /*TODO: add test for Block/user/view module? */

})
