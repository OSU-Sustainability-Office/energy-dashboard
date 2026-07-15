/**
 * @Description: Unit tests for the Vuex store map module (Vue 3 / Vitest).
 */

import { describe, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'
import axios from 'axios'

import EDMap from '@/store/map.module.js'

// Mock API Data
import mockAllBuildings from '../../assertedData/mock_allbuildings.json'

// The store calls the default axios export (src/store/api.js), so mock it as a
// single callable that every API helper flows through.
vi.mock('axios', () => ({ default: vi.fn() }))

describe('Testing Map Module...', () => {
  // Build a fresh, isolated store from just the map module.
  const localStore = createStore({
    modules: {
      map: cloneDeep(EDMap)
    }
  })

  it('Calling Load Map...', async () => {
    // The real /allbuildings response includes a geoJSON string per building; the
    // fixture omits it, so add a valid empty one to keep loadBuilding on its happy
    // path (a truthy geoJSON skips the follow-up OSM fetch).
    const buildings = mockAllBuildings.map(building => ({
      ...building,
      geoJSON: JSON.stringify({ type: 'FeatureCollection', features: [] })
    }))
    axios.mockResolvedValue({ data: buildings })

    // This single action loads all the buildings, meter groups & meter modules.
    await localStore.dispatch('map/loadMap')

    // See if this correctly setup the Building modules
    for (const building of mockAllBuildings) {
      const buildingModulePath = 'map/building_' + building.id.toString()

      // Check that the building object got loaded correctly
      for (const attribute of Object.keys(building)) {
        if (attribute !== 'meterGroups') {
          expect(localStore.getters[buildingModulePath + `/${attribute}`]).toEqual(building[attribute])
        }
      }

      for (const MeterGroup of building.meterGroups) {
        const MeterGroupModulePath = buildingModulePath + '/meterGroup_' + MeterGroup.id.toString()

        // Check that the Meter Groups got loaded correctly
        for (const attribute of Object.keys(MeterGroup)) {
          if (attribute !== 'meters') {
            expect(localStore.getters[MeterGroupModulePath + `/${attribute}`]).toEqual(MeterGroup[attribute])
          }
        }

        for (const Meter of MeterGroup.meters) {
          const MeterModulePath = MeterGroupModulePath + '/meter_' + Meter.id.toString()

          // Finally, check that the Meter module got loaded correctly
          for (const attribute of Object.keys(Meter)) {
            expect(localStore.getters[MeterModulePath + `/${attribute}`]).toEqual(Meter[attribute])
          }
        }
      }
    }
  })
})
