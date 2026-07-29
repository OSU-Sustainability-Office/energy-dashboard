/**
 * @Description: Tests for the "no data available" alert in ChartController.vue.
 *
 * The chart modifiers stamp a point with the END of the interval it covers
 * (periodic_real's day bucket key is the midnight *after* the day it covers,
 * accumulated_real pushes `i + delta`). Monthly periodic_real buckets are the
 * exception: they are stamped with the START of the month they cover. The alert
 * has to account for both, or it fires on every building and reports a date one
 * interval too late.
 */

import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'

import ChartController from '@/components/charts/ChartController.vue'

const BLOCK_PATH = 'map/building_1/block_1'
const CHART_PATH = `${BLOCK_PATH}/chart_1`

// Dates are built from local-time components so the assertions hold regardless
// of the timezone the test runner happens to be in.
const localDate = (year, monthIndex, day, hour = 0, minute = 0) => new Date(year, monthIndex, day, hour, minute)

// Mimics a daily dataset as the modifiers emit it: the point for a given day is
// stamped with the following midnight.
function dailyBuckets(firstDayCovered, dayCount) {
  return Array.from({ length: dayCount }, (unused, i) => ({
    x: localDate(firstDayCovered.getFullYear(), firstDayCovered.getMonth(), firstDayCovered.getDate() + i + 1),
    y: 40 + i
  }))
}

// Mimics a monthly periodic_real dataset: the point for a given month is stamped
// with the start of that month's bucket.
function monthlyBuckets(firstMonthCovered, monthCount) {
  return Array.from({ length: monthCount }, (unused, i) => ({
    x: localDate(firstMonthCovered.getFullYear(), firstMonthCovered.getMonth() + i, firstMonthCovered.getDate()),
    y: 900 + i
  }))
}

function createTestStore({ dateStart, data, intervalUnit = 'day', dateInterval = 1, point = 'periodic_real_in' }) {
  return createStore({
    modules: {
      dataStore: {
        namespaced: true,
        getters: { batchStatus: () => ({ active: false, current: 0, total: 0 }) }
      },
      map: {
        namespaced: true,
        modules: {
          building_1: {
            namespaced: true,
            modules: {
              block_1: {
                namespaced: true,
                getters: {
                  promise: () => Promise.resolve(),
                  dateStart: () => dateStart.getTime(),
                  dateEnd: () => localDate(2026, 6, 11).getTime(),
                  graphType: () => 1,
                  intervalUnit: () => intervalUnit,
                  dateInterval: () => dateInterval,
                  charts: () => [{ path: CHART_PATH }]
                },
                actions: {
                  getData: () => ({ datasets: [{ label: 'Electricity', data: data.map(p => ({ ...p })) }] })
                },
                modules: {
                  chart_1: {
                    namespaced: true,
                    getters: {
                      point: () => point,
                      unitString: () => 'kWh',
                      pointString: () => 'Net Energy Usage (kWh)'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}

// ChartController reaches into the rendered chart to set axis options, so the
// stub has to carry the same `options` shape the real chart components expose.
const chartStub = {
  template: '<div class="chart-stub" />',
  data: () => ({ options: { scales: { x: { time: {} }, y: { ticks: {} } } } })
}

async function mountController(store) {
  const wrapper = mount(ChartController, {
    props: { path: BLOCK_PATH, height: 400, styleC: {}, randomColors: 0, invertColors: false },
    global: {
      plugins: [store, ElementPlus],
      mocks: { $route: { path: '/buildings' } },
      stubs: { Linechart: chartStub, Barchart: chartStub }
    }
  })
  await wrapper.vm.updateChart()
  await flushPromises()
  return wrapper
}

describe('ChartController "no data available" alert', () => {
  it('stays hidden when the data covers the whole selected range', async () => {
    // Default building view: the block starts at 22:45 on May 12 and the meter
    // has a reading for May 12 (stamped May 13 00:00). Nothing is missing.
    const store = createTestStore({
      dateStart: localDate(2026, 4, 12, 22, 45),
      data: dailyBuckets(localDate(2026, 4, 12), 30)
    })

    const wrapper = await mountController(store)

    expect(wrapper.find('.data-clamp-alert').exists()).toBe(false)
  })

  it('names the first day that has data when the range starts before the data', async () => {
    // User asked for April 27 onward, but the meter's first reading covers May 12.
    const store = createTestStore({
      dateStart: localDate(2026, 3, 27),
      data: dailyBuckets(localDate(2026, 4, 12), 30)
    })

    const wrapper = await mountController(store)

    const alert = wrapper.find('.data-clamp-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('No data available before Tue May 12 2026')
  })

  it('names the first month that has data for monthly periodic_real charts', async () => {
    // Monthly periodic_real points are already stamped at the start of the month
    // they cover, so no interval must be subtracted from them.
    const store = createTestStore({
      dateStart: localDate(2026, 0, 15),
      data: monthlyBuckets(localDate(2026, 3, 15), 3),
      intervalUnit: 'month'
    })

    const wrapper = await mountController(store)

    const alert = wrapper.find('.data-clamp-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('No data available before Wed Apr 15 2026')
  })
})

/**
 * Consumers drop ChartController into fixed-height containers (BuildingModal's
 * carousel is a hard 250px with overflow: hidden), so the alert must never add
 * height on top of the chart -- it has to come out of the same box. jsdom has no
 * layout engine, so these lock the DOM contract that makes that work rather than
 * measuring pixels; the visual result needs a browser.
 */
describe('ChartController layout footprint', () => {
  const withAlert = () =>
    createTestStore({
      dateStart: localDate(2026, 3, 27),
      data: dailyBuckets(localDate(2026, 4, 12), 30)
    })

  const withoutAlert = () =>
    createTestStore({
      dateStart: localDate(2026, 4, 12, 22, 45),
      data: dailyBuckets(localDate(2026, 4, 12), 30)
    })

  it('pins the root to the full height prop whether or not the alert shows', async () => {
    for (const store of [withAlert(), withoutAlert()]) {
      const wrapper = await mountController(store)

      // mountController passes height: 400
      expect(wrapper.element.style.height).toBe('400px')
    }
  })

  it('never puts the fixed height on the chart box, so it can flex', async () => {
    const wrapper = await mountController(withAlert())

    // The height belongs to the root only; a fixed height here would push the
    // chart past the container and reintroduce the clipping.
    expect(wrapper.find('.chart-box').element.style.height).toBe('')
  })

  it('keeps the alert and the chart box as siblings inside the root', async () => {
    const wrapper = await mountController(withAlert())

    const children = Array.from(wrapper.element.children)
    expect(children).toHaveLength(2)
    expect(children[0].classList.contains('data-clamp-alert')).toBe(true)
    expect(children[1].classList.contains('chart-box')).toBe(true)
  })
})
