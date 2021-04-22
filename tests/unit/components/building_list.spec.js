/**
* @Author: Milan Donhowe
* @Email: Milan.Donhowe@oregosntate.edu
* @Date Created:       4/20/2021
* @Date Last Modified: 4/20/2021
* @Description: Vue Component Unit Test for building_list.vue
*/

// For mocking API
const axios = require('axios')

// Import Vue Test Utils
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

// Import Relevant Vuex Store Modules
import { StoreConfig } from '@/store/index'
import EDMap from '@/store/map.module.js'
import ModalController from '@/store/modal_controller.module.js'

// Mock Data
import mockAllBuildings from "../../assertedData/mock_allbuildings.json"

// Import Elements UI (since this component uses Elements-UI)
import elm from 'element-ui'
import Vuei18n from 'vue-i18n'
import locale from 'element-ui/lib/locale/lang/en'

// The Component Itself
import buildingList from '@/components/building_list/building_list.vue' 


jest.mock('axios')

// Mock Vue Router object
const $route = {
  path: '/buildings',
  hash: '',
  params: {group: undefined}
}

// Create local vue instance.
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuei18n)
localVue.use(elm, {locale: locale})
localVue.config.lang = 'en'

// Create Vuex Store instance
const localStore = new Vuex.Store(cloneDeep({...StoreConfig, modules: {
  map: EDMap,
  modalController:ModalController,
}}))

describe('Testing Building List Component', () => {

  it ('Loading associated store', async () => {
    axios.mockResolvedValue({data: mockAllBuildings})
    return await localStore.dispatch('map/loadMap')
  })
  
  /* Load Component w/ router mock, local vue & vuex instances */
  const ComponentWrapper = mount(buildingList, {
    localVue,
    mocks:{
      $route,
      $store: localStore
    }
  })

  it ('Renders building names on mount', async () => {
    const textContent = ComponentWrapper.text()
    for (let building of mockAllBuildings){
      if (!building.hidden) expect(textContent).toMatch(building.name)
    }
  })

  it ('Testing building filter', async () => {
    const Tabs = ComponentWrapper.findAll('div span.tab_label')

    for (let tabIndex = 0; tabIndex < Tabs.length; tabIndex++){
      const Tab = Tabs.at(tabIndex)
      const selector = Tab.text().trim()

      if (selector !== 'All'){
        // TODO: figure out why text content isn't updating
        await Tab.trigger('click')
        await localVue.nextTick();

        const matchedBuildings = mockAllBuildings.filter(b => b.group === selector)
        for (let building of mockAllBuildings){
          console.log(`Testing if ${building.name} gets matched by ${selector}`)
          if (matchedBuildings.includes(building.name)){
            expect(ComponentWrapper.text()).toMatch(building.name)
          } else {
            expect(ComponentWrapper.text()).not.toMatch(building.name)
          }
        }

      }
    }
    return true
  })
})
