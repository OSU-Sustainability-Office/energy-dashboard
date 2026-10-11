/**
 * @Description: Unit tests for the campus Vuex module, and for the campus
 *               scoping it applies to the map module's list getters.
 */

import { describe, it, expect } from 'vitest'
import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'

import Campus, { DEFAULT_CAMPUS } from '@/store/campus.module.js'
import EDMap from '@/store/map.module.js'

const freshStore = () => createStore({ modules: { campus: cloneDeep(Campus), map: cloneDeep(EDMap) } })

// Minimal shape of an /allbuildings entry: enough for loadBuilding to register a
// module without pulling in meter groups.
const building = (id, campus, group = 'Academics') => ({
  id,
  name: 'Building ' + id,
  group,
  campus,
  mapId: '',
  image: null,
  hidden: false,
  geoJSON: JSON.stringify({ type: 'Feature', geometry: null, properties: {} }),
  meterGroups: []
})

describe('Campus module', () => {
  it('offers both campuses and answers Corvallis before a choice is made', () => {
    const store = freshStore()
    expect(store.getters['campus/campuses'].map(c => c.id)).toEqual(['corvallis', 'cascades'])
    expect(store.getters['campus/active']).toBe(DEFAULT_CAMPUS)
    expect(store.getters['campus/chosen']).toBe(false)
  })

  it('records a choice and reports it as chosen', () => {
    const store = freshStore()
    store.dispatch('campus/choose', 'cascades')
    expect(store.getters['campus/active']).toBe('cascades')
    expect(store.getters['campus/chosen']).toBe(true)
    expect(store.getters['campus/label']).toBe('Cascades')
  })

  it('ignores an unrecognised campus', () => {
    const store = freshStore()
    store.dispatch('campus/choose', 'springfield')
    expect(store.getters['campus/chosen']).toBe(false)
  })

  it('asks again on every load, even after an earlier session chose', () => {
    // The picker is meant to open on every visit, so nothing may carry a choice
    // over -- including a value left in localStorage by an older build.
    window.localStorage.setItem('osu-energy.campus', 'cascades')
    freshStore().dispatch('campus/choose', 'cascades')

    const nextVisit = freshStore()
    expect(nextVisit.getters['campus/chosen']).toBe(false)
    expect(nextVisit.getters['campus/active']).toBe(DEFAULT_CAMPUS)
    window.localStorage.clear()
  })
})

describe('Campus scoping of the map getters', () => {
  it('scopes the list getters to the active campus, but never a direct lookup', async () => {
    const store = freshStore()
    await store.dispatch('map/loadBuilding', building(1, 'corvallis'))
    await store.dispatch('map/loadBuilding', building(2, 'corvallis', 'Residential Life'))
    await store.dispatch('map/loadBuilding', building(3, 'cascades'))

    expect(store.getters['map/buildings'].map(b => b.id)).toEqual([1, 2])
    expect([...store.getters['map/buildingGroups']]).toEqual(['Academics', 'Residential Life'])
    expect(store.getters['map/buildingsForGroup']('Academics').map(b => b.id)).toEqual([1])

    store.dispatch('campus/choose', 'cascades')

    expect(store.getters['map/buildings'].map(b => b.id)).toEqual([3])
    expect([...store.getters['map/buildingGroups']]).toEqual(['Academics'])
    expect(store.getters['map/buildingsForGroup']('Residential Life')).toEqual([])

    // Deep links must survive whichever campus is selected.
    expect(store.getters['map/building'](1).name).toBe('Building 1')
  })

  it('treats a building with no campus as Corvallis', async () => {
    const store = freshStore()
    const legacy = building(9, undefined)
    delete legacy.campus
    await store.dispatch('map/loadBuilding', legacy)
    expect(store.getters['map/buildings'].map(b => b.id)).toEqual([9])
  })

  it('still lists buildings when the campus module is not registered', async () => {
    // Returning nothing would be a far worse failure than ignoring the filter.
    const store = createStore({ modules: { map: cloneDeep(EDMap) } })
    await store.dispatch('map/loadBuilding', building(1, 'corvallis'))
    expect(store.getters['map/buildings'].map(b => b.id)).toEqual([1])
  })
})
