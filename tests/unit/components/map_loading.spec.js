/**
 * @Description: Regression test for the map's loading indicator (Vue 3 / Vitest).
 *
 * Campus filtering made "this campus has no buildings" a legitimate steady state.
 * The overlay used a non-empty building list as its proxy for "buildings have
 * loaded", so an empty campus span forever instead of drawing an empty map.
 */

import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'

// Imported under another name: `Map` would shadow the global Map constructor
// that the store's buildingMap getter needs.
import MapView from '@/components/map/Map.vue'

const stubs = {
  'l-map': { template: '<div><slot /></div>' },
  'l-tile-layer': true,
  'l-geo-json': true,
  BuildingModal: true,
  BuildingCompareModal: true,
  ComparePrompt: true,
  CompareError: true,
  CompareButton: true,
  BuildingMenuButton: true,
  CategoryToggle: true
}

function createTestStore({ buildings = [], loadMap = () => Promise.resolve() } = {}) {
  return createStore({
    modules: {
      campus: { namespaced: true, getters: { active: () => 'cascades' } },
      modalController: {
        namespaced: true,
        getters: { modalName: () => null },
        actions: { closeModal: () => {} }
      },
      map: {
        namespaced: true,
        getters: {
          buildings: () => buildings,
          buildingMap: () => new Map(),
          promise: () => Promise.resolve(),
          building: () => id => buildings.find(b => b.id === id) || {}
        },
        actions: { loadMap }
      }
    }
  })
}

const mountMap = store => mount(MapView, { global: { plugins: [store, ElementPlus], stubs } })

describe('Map loading indicator', () => {
  it('stops loading when the selected campus has no buildings', async () => {
    const wrapper = mountMap(createTestStore({ buildings: [] }))
    await flushPromises()

    // Nothing to draw is a finished state, not a pending one.
    expect(wrapper.vm.mapLoaded).toBe(true)
  })

  it('still shows loading until the buildings have actually been fetched', async () => {
    const neverResolves = () => new Promise(() => {})
    const wrapper = mountMap(createTestStore({ buildings: [], loadMap: neverResolves }))
    await flushPromises()

    expect(wrapper.vm.mapLoaded).toBe(false)
  })
})
