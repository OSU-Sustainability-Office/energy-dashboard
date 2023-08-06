/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T14:36:18-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by: Milan Donhowe
 * @Last modified time: 4/13/2021
 * @Description: This file describes unit tests for the Vuex store map module.
 */

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

// import the vuex store configuration object
import { StoreConfig } from '@/store/index'

// Also import all the needed store modules (needed for cloneDeep)
import EDMap from '@/store/map.module.js'

// Mock API Data
import mockAllBuildings from '../../assertedData/mock_allbuildings.json'

const axios = require( 'axios' )

jest.mock( 'axios' )

describe( 'Testing Map Module...', () => {
  // Create local deep-copy of Vue & Vuex instances
  const localVue = createLocalVue()
  localVue.use( Vuex )
  const localStore = new Vuex.Store(
    cloneDeep( {
      ...StoreConfig,
      modules: {
        map: EDMap
      }
    } )
  )

  it( 'Calling Load Map...', async () => {
    axios.mockResolvedValue( { data: mockAllBuildings } )

    // This single action loads all the buildings, meter groups & meter modules.
    await localStore.dispatch( 'map/loadMap' )

    // See if this correctly setup the Building modules
    for ( let building of mockAllBuildings ) {
      let buildingModulePath = 'map/building_' + building.id.toString()

      // Check that the building object got loaded correctly
      for ( let attribute of Object.keys( building ) ) {
        if ( attribute !== 'meterGroups' ) {
          expect( localStore.getters[buildingModulePath + `/${attribute}`] ).toEqual( building[attribute] )
        }
      }

      for ( let MeterGroup of building.meterGroups ) {
        let MeterGroupModulePath = buildingModulePath + '/meterGroup_' + MeterGroup.id.toString()

        // Check that the Meter Groups got loaded correctly
        for ( let attribute of Object.keys( MeterGroup ) ) {
          if ( attribute !== 'meters' ) {
            expect( localStore.getters[MeterGroupModulePath + `/${attribute}`] ).toEqual( MeterGroup[attribute] )
          }
        }

        for ( let Meter of MeterGroup.meters ) {
          let MeterModulePath = MeterGroupModulePath + '/meter_' + Meter.id.toString()

          // Finally, check that the Meter module got loaded correctly
          for ( let attribute of Object.keys( Meter ) ) {
            expect( localStore.getters[MeterModulePath + `/${attribute}`] ).toEqual( Meter[attribute] )
          }
        }
      }
    }
  } )
} )
