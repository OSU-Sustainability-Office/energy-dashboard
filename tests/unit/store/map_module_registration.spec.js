/**
 * @Description: Guards the cost of building the store on startup.
 *
 * Vuex rebuilds every getter in the store on each registerModule call
 * (resetStoreState), so registering one module per building, meter group, meter,
 * block and chart makes startup O(n^2) -- ~600 registrations and ~6,700 getters
 * against production data, which froze the main thread for seconds. Each entity
 * still gets its own module; they are just registered as whole subtrees so the
 * getter rebuild happens once per subtree instead of once per entity.
 */

import { describe, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'
import axios from 'axios'

import EDMap from '@/store/map.module.js'

import mockAllBuildings from '../../assertedData/mock_allbuildings.json'

vi.mock('axios', () => ({ default: vi.fn() }))

describe('Map module registration cost', () => {
  it('registers one module subtree per building and per default block', async () => {
    const buildings = mockAllBuildings.map(building => ({
      ...building,
      geoJSON: JSON.stringify({ type: 'FeatureCollection', features: [] })
    }))
    axios.mockResolvedValue({ data: buildings })

    const localStore = createStore({ modules: { map: cloneDeep(EDMap) } })

    const registeredPaths = []
    const originalRegister = localStore.registerModule.bind(localStore)
    localStore.registerModule = (path, mod, options) => {
      registeredPaths.push(Array.isArray(path) ? path.join('/') : path)
      return originalRegister(path, mod, options)
    }

    await localStore.dispatch('map/loadMap')

    // One call per building, carrying its meter groups, meters, default blocks
    // and their charts -- not one call per entity.
    expect(registeredPaths.length).toBe(buildings.length)

    // Nothing registered twice: a repeat call would pay the full rebuild again.
    expect(new Set(registeredPaths).size).toBe(registeredPaths.length)
  })
})
