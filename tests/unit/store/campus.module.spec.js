/**
 * @Description: Unit tests for the campus Vuex module, and for the campus
 *               scoping it applies to the map module's list getters.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'

import Campus, { DEFAULT_CAMPUS } from '@/store/campus.module.js'
import EDMap from '@/store/map.module.js'

const STORAGE_KEY = 'osu-energy.campus'

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
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('offers both campuses and answers Corvallis before a choice is made', () => {
    const store = freshStore()
    expect(store.getters['campus/campuses'].map(c => c.id)).toEqual(['corvallis', 'cascades'])
    expect(store.getters['campus/active']).toBe(DEFAULT_CAMPUS)
    expect(store.getters['campus/chosen']).toBe(false)
  })

  it('records a choice, persists it, and reports it as chosen', () => {
    const store = freshStore()
    store.dispatch('campus/choose', 'cascades')
    expect(store.getters['campus/active']).toBe('cascades')
    expect(store.getters['campus/chosen']).toBe(true)
    expect(store.getters['campus/label']).toBe('Cascades')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('cascades')
  })

  it('ignores an unrecognised campus', () => {
    const store = freshStore()
    store.dispatch('campus/choose', 'springfield')
    expect(store.getters['campus/chosen']).toBe(false)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('restores a remembered choice and ignores a corrupted one', () => {
    window.localStorage.setItem(STORAGE_KEY, 'cascades')
    const remembered = freshStore()
    remembered.dispatch('campus/restore')
    expect(remembered.getters['campus/active']).toBe('cascades')
    expect(remembered.getters['campus/chosen']).toBe(true)

    window.localStorage.setItem(STORAGE_KEY, 'not-a-campus')
    const corrupted = freshStore()
    corrupted.dispatch('campus/restore')
    expect(corrupted.getters['campus/chosen']).toBe(false)
  })

  it('keeps working when localStorage throws', () => {
    // Browsers with site data blocked throw on read and write alike. Remembering
    // the choice is a convenience; losing it must not break the session.
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('access denied')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('access denied')
    })

    const store = freshStore()
    expect(() => store.dispatch('campus/restore')).not.toThrow()
    expect(() => store.dispatch('campus/choose', 'cascades')).not.toThrow()
    expect(store.getters['campus/active']).toBe('cascades')
    expect(getItem).toHaveBeenCalled()
    expect(setItem).toHaveBeenCalled()
  })
})

describe('Campus scoping of the map getters', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

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
