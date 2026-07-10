/**
 * @Description: Vue store test for the Data Store module (Vue 3 / Vitest).
 */

import { describe, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'
import axios from 'axios'

import DataStore from '@/store/data_layer/data_store.js'

// Mock API Data
import mockMeterReadings from '../../assertedData/mock_meter_data.json'

// The store calls the default axios export (src/store/api.js).
vi.mock('axios', () => ({ default: vi.fn() }))

describe('Testing Data Store Vuex Module', () => {
  // Build a fresh, isolated store from just the dataStore module.
  const localStore = createStore({
    modules: {
      dataStore: cloneDeep(DataStore)
    }
  })

  it('Testing API Query', async () => {
    axios.mockResolvedValue({ data: mockMeterReadings })
    const payload = {
      meterId: 5,
      start: 1613232900,
      end: 1618504200,
      uom: 'accumulated_real'
    }

    const formattedData = await localStore.dispatch('dataStore/getData', payload)

    // make sure we received the expected number of responses
    expect(formattedData.length).toEqual(mockMeterReadings.length)
  })
})
