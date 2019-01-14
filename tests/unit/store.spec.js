/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T14:36:18-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-07T14:24:13-08:00
 */
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import createStoreConfig from '@/store/storeconfig.js'

import assertedStories from '../assertedData/stories.json'
import assertedStory from '../assertedData/story.json'
import assertedBaseline from '../assertedData/baseline.json'

/* eslint-disable-next-line */
jest.mock('@/store/api')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Testing Vuex Store', () => {
  describe('Testing Actions', () => {
    test('Can get stories', async () => {
      const store = new Vuex.Store(createStoreConfig())
      let r = await store.dispatch('stories')
      expect(r).toMatchObject(assertedStories)
    })

    test('Can get story', async () => {
      const store = new Vuex.Store(createStoreConfig())
      let r = await store.dispatch('story', 95)
      expect(r).toMatchObject(assertedStory)
    })

    test('Can make a proper baseline', async () => {
      const store = new Vuex.Store(createStoreConfig())
      let r = await store.dispatch('baseline', {
        meters: [{ meter_id: 1, negate: null, operation: 1, type: 'e' }],
        point: 'accumulated_real',
        date_start: '2018-06-01T00:15:00.000Z',
        date_end: '2018-06-15T00:15:00.000Z',
        date_interval: 'minute',
        interval_unit: 15
      })
      expect(r).toMatchObject(assertedBaseline)
    })
  })
})
