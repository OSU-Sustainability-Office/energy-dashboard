/**
 * @Description: Component render test for BuildingList.vue (Vue 3 / Vitest).
 */

import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'

import BuildingList from '@/components/building_list/BuildingList.vue'

// Mock Data
import mockAllBuildings from '../../assertedData/mock_allbuildings.json'

const visibleBuildings = mockAllBuildings.filter(building => !building.hidden)

// A minimal map module exposing only what BuildingList and its cards read:
// the list of buildings, a resolved load promise, and per-id lookup.
function createTestStore() {
  return createStore({
    modules: {
      map: {
        namespaced: true,
        getters: {
          buildings: () => visibleBuildings,
          promise: () => Promise.resolve(),
          building: () => id => visibleBuildings.find(building => building.id === id) || {}
        }
      }
    }
  })
}

describe('Testing Building List Component', () => {
  it('renders building names for the loaded buildings', async () => {
    const wrapper = mount(BuildingList, {
      global: {
        plugins: [createTestStore(), ElementPlus],
        mocks: {
          $route: { path: '/buildings', params: { group: undefined } },
          $router: { push: () => {} }
        }
      }
    })

    // BuildingList awaits map/promise in mounted before rendering the tabs.
    await flushPromises()

    const text = wrapper.text()
    for (const building of visibleBuildings) {
      expect(text).toContain(building.name)
    }
  })
})
