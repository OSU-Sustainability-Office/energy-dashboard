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

const emptyGeoJSON = () => JSON.stringify({ type: 'FeatureCollection', features: [] })

// The map/buildings getter omits hidden buildings, so that is the count to expect.
const visibleBuildingCount = mockAllBuildings.filter(building => !building.hidden).length

// A fresh store per test — loadMap memoises into state.promise, so a shared store
// would let one test's result leak into the next.
const freshStore = () => createStore({ modules: { map: cloneDeep(EDMap) } })

// Routes the single axios mock by URL: /allbuildings vs the Overpass interpreter
// call that backfills geometry for buildings whose geoJSON is not inlined.
function mockApi({ buildings, overpass }) {
  axios.mockImplementation(url => {
    if (String(url).includes('interpreter')) {
      return overpass ? overpass() : Promise.resolve({ data: '<osm></osm>' })
    }
    return buildings ? buildings() : Promise.resolve({ data: [] })
  })
}

// One building deliberately has no geoJSON but does have a mapId, which is what
// pushes it into buildingMap and triggers the Overpass fetch.
function buildingsWithOneMissingGeometry() {
  return mockAllBuildings.map((building, index) =>
    index === 0 ? { ...building, geoJSON: null, mapId: '92994899' } : { ...building, geoJSON: emptyGeoJSON() }
  )
}

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

/**
 * The buildings tab (BuildingList) and the campaign/block modules all await
 * map/promise, but none of them render geometry — they only need building and
 * meter-group metadata. Geometry for the handful of buildings whose geoJSON is not
 * inlined in /allbuildings is fetched from a third-party Overpass mirror, which in
 * practice varies from under a second to several seconds and can fail outright.
 *
 * Awaiting that fetch inside map/promise made every one of those consumers hostage
 * to it: the buildings tab sat on a spinner until campus polygons arrived, and a
 * failure left it spinning permanently.
 */
describe('Map module load does not block on geometry', () => {
  it('resolves even when the Overpass geometry fetch fails', async () => {
    const store = freshStore()
    mockApi({
      buildings: () => Promise.resolve({ data: buildingsWithOneMissingGeometry() }),
      overpass: () => Promise.reject(new Error('Overpass mirror unreachable'))
    })

    // loadMap resolves to undefined, so assert on completion rather than a value.
    let error = null
    try {
      await store.dispatch('map/loadMap')
    } catch (err) {
      error = err
    }
    expect(error).toBeNull()
  })

  it('exposes building metadata even when the geometry fetch fails', async () => {
    const store = freshStore()
    mockApi({
      buildings: () => Promise.resolve({ data: buildingsWithOneMissingGeometry() }),
      overpass: () => Promise.reject(new Error('Overpass mirror unreachable'))
    })

    await store.dispatch('map/loadMap')

    // This is all the buildings tab needs to render.
    expect(store.getters['map/buildings'].length).toBe(visibleBuildingCount)
    expect(store.getters[`map/building_${mockAllBuildings[0].id}/name`]).toBe(mockAllBuildings[0].name)
  })

  it('does not block on a slow geometry fetch that never settles', async () => {
    const store = freshStore()
    mockApi({
      buildings: () => Promise.resolve({ data: buildingsWithOneMissingGeometry() }),
      // Mirrors the real hazard: axios is configured with a 72 second timeout, so a
      // hung mirror stalls anything awaiting it for over a minute.
      overpass: () => new Promise(() => {})
    })

    const settled = await Promise.race([
      store.dispatch('map/loadMap').then(() => 'loaded'),
      new Promise(resolve => setTimeout(() => resolve('still waiting'), 500))
    ])

    expect(settled).toBe('loaded')
  })

  it('clears the cached promise when the load fails so a retry can succeed', async () => {
    const store = freshStore()
    mockApi({ buildings: () => Promise.reject(new Error('/allbuildings unavailable')) })

    await expect(store.dispatch('map/loadMap')).rejects.toThrow()

    // A rejected promise left in state is returned to every future caller, so the
    // app can never recover without a full page reload.
    expect(store.getters['map/promise']).toBe(null)

    mockApi({ buildings: () => Promise.resolve({ data: buildingsWithOneMissingGeometry() }) })
    await store.dispatch('map/loadMap')
    expect(store.getters['map/buildings'].length).toBe(visibleBuildingCount)
  })
})
