/**
 * @Author: Milan Donhowe
 * @Email: Milan.Donhowe@oregosntate.edu
 * @Date Created:       4/20/2021
 * @Date Last Modified: 4/20/2021
 * @Description: Vue Store test for Data Store
 */

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

// import the vuex store configuration object
import { StoreConfig } from '@/store/index'

import DataStore from '@/store/data_layer/data_store.js'

// Mock API Data
import mockMeterReadings from '../../assertedData/mock_meter_data.json'

const axios = require( 'axios' )

jest.mock( 'axios' )

describe( 'Testing Data Store Vuex Module', () => {
  // Create local deep-copy of Vue & Vuex instances
  const localVue = createLocalVue()
  localVue.use( Vuex )
  const localStore = new Vuex.Store(
    cloneDeep( {
      ...StoreConfig,
      modules: {
        dataStore: DataStore
      }
    } )
  )

  it( 'Testing Remote System Now', async () => {
    const mockTime = Date.now().toString()
    axios.mockResolvedValue( { data: mockTime } )

    await localStore.dispatch( 'dataStore/loadSystemNow' )
    return expect( localStore.getters['dataStore/SystemNow'] ).toBe(
      Number( mockTime )
    )
  } )

  it( 'Testing API Query', async () => {
    axios.mockResolvedValue( { data: mockMeterReadings } )
    const payload = {
      meterId: 5,
      start: 1613232900,
      end: 1618504200,
      uom: 'accumulated_real'
    }

    const formattedData = await localStore.dispatch(
      'dataStore/getData',
      payload
    )

    // make sure we recieved the expected number of responses
    expect( formattedData.length ).toEqual( mockMeterReadings.length )
  } )
} )
