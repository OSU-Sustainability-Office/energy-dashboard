/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:35:53-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
<<<<<<< HEAD
 * @Last modified time: 2019-01-04T12:29:32-08:00
=======
 * @Last modified time: 2018-12-21T13:01:41-08:00
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
 */
import api from './api.js'

export default {
  story: async (context, id) => {
    try {
      if (context.getters.currentStory && id === context.getters.currentStory.id) {
        return Promise.resolve(context.getters.currentStory)
      } else {
        context.commit('loadStory', {
          name: '',
          id: null,
          description: '',
          public: false,
          media: '',
          blocks: [],
          modified: false,
          removed: []
        })
        let story = await api.story(id)

        for (let chart of story.openCharts) {
          let b = story.blocks.find(el => el.id === chart.block_id)
          // First put meters into charts
          for (let meter of story.openMeters) {
            if (((chart.meter === 0 && meter.type === 'e') || chart.meter === meter.meter_id) && meter.chart_id === chart.id) {
              if (chart.meters) {
                chart.meters.push(meter)
                story.openMeters.splice(story.openMeters.indexOf(meter), 1)
              } else {
                chart.meters = [meter]
              }
            }
          }
          // Then put charts into blocks
          if (b.charts) {
            b.charts.push(chart)
          } else {
            b.charts = [chart]
          }
        }
        // Clean Boy
        delete story.openCharts
        delete story.openMeters

        context.commit('loadStory', story)
        for (let b in story.blocks) {
          await context.dispatch('block', { index: b })
        }
        return Promise.resolve(story)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },
  stories: async context => {
    try {
      if (context.getters.stories.length > 0) {
        return Promise.resolve(context.getters.stories)
      } else {
        let stories = await api.stories()
        let master = []
        for (let row of stories) {
          if (!master.find(elm => { return elm.id === row.group_id })) {
            master.push({ group: row.group_name, stories: [ row ], public: row.group_public, id: row.group_id })
          } else {
            master.find(elm => { return elm.id === row.group_id }).stories.push(row)
          }
        }
        context.commit('loadStories', master)
        return Promise.resolve(context.getters.stories)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },

<<<<<<< HEAD
  buildings: async () => {
=======
  buildings: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      return Promise.resolve(await api.buildings())
    } catch (error) {
      return Promise.reject(error)
    }
  },

  building: async (context, payload) => {
    try {
      if (payload.blockIndex === null || payload.chartIndex === null || context.getters.story.blocks.length < payload.blockIndex || context.getters.story.blocks[payload.blockIndex].charts.length < payload.chartIndex) {
        throw new Error('Building action needs existing chart and block index')
      }
      if (!payload.group_id) {
        throw new Error('Building action needs group id')
      }
      let meters = await api.meters(payload.group_id)
      let r = []
      for (let meter of meters) {
        if (meter.type === 'e') {
          r.push(meter)
        }
      }
      await context.dispatch('block', { index: payload.blockIndex, charts: [{ index: payload.chartIndex, group_id: payload.group_id, meters: r, point: 'accumulated_real' }] })
      return Promise.resolve(context.getters.block(payload.blockIndex))
    } catch (error) {
      return Promise.reject(error)
    }
  },

  block: async (context, payload) => {
    try {
      if (payload.index === null) {
        throw new Error('Block action needs index')
      }
      let block = {}
      if (context.getters.block(payload.index)) {
        // Deep copy prevents callbacks to data changing on computed variables
        block = JSON.parse(JSON.stringify(context.getters.block(payload.index)))
      }
      // Manipulate old block to conform to payloads new keys
      for (let blockKey of Object.keys(payload)) {
        // Special case for charts
        if (blockKey === 'charts') {
          for (let chartObj of payload.charts) {
            if (chartObj.index === undefined) {
              block[blockKey] = payload[blockKey]
              continue
            }
            let chartIndex = chartObj.index
            for (let chartKey of Object.keys(chartObj)) {
              block.charts[chartIndex][chartKey] = chartObj[chartKey]
            }
          }
        } else {
          block[blockKey] = payload[blockKey]
        }
      }
      let morePromises = []
      // Aqquire new data for the charts since they were manipulated
      for (let chartIndex in block.charts) {
        morePromises.push((async () => {
          let chartPromises = []
          for (let meter of block.charts[chartIndex].meters) {
            let start = new Date(block.date_start)
            // Get One extra element based on int and unit

            start.setMinutes(Math.floor(start.getMinutes() / 15.0) * 15)
            start.setSeconds(0)
            start.setMilliseconds(0)
            start.setMinutes(start.getMinutes() - 15)
            if (block.interval_unit === 'minute') {
              start.setMinutes(start.getMinutes() - (block.date_interval - 15))
            } else if (block.interval_unit === 'hour') {
              start.setHours(start.getHours() - block.date_interval)
            } else if (block.interval_unit === 'day') {
              start.setDate(start.getDate() - block.date_interval)
            } else if (block.interval_unit === 'month') {
              start.setMonth(start.getMonth() - block.date_interval)
            }

            chartPromises.push(api.data(meter.meter_id, start.toISOString(), block.date_end, block.charts[chartIndex].point))
          }
          let r = await Promise.all(chartPromises)
          let finalData = []
          const map = {
            pf_a: 1,
            pf_b: 1,
            pf_c: 1,
            reactive_a: 1,
            reactive_b: 1,
            reactive_c: 1,
            default: 0
          }
          for (let set in r) {
            if (!r[set] || r[set].length <= 0) {
              // If we dont get any data in the set skip to the next set
              continue
            }
            // get multiplier for oddly hooked up meters for points that can be negative
            const multiplier = ((block.charts[chartIndex].meters[set].negate) ? -1 : 1) * (map[Object.keys(r[set][0])[1]] || map['default'])
            // get negation factor for accumulated_real
            let mu2 = (block.charts[chartIndex].meters[set].operation) ? 1 : -1
            if (block.charts[chartIndex].meters.length === 1) {
              mu2 = 1
            }
            if (multiplier === 0) {
              let insert = 0
              for (let data of r[set]) {
                while (insert < finalData.length && data.time > finalData[insert].x) {
                  insert++
                }
                if (insert === finalData.length) {
                  finalData.push({x: data.time, y: Math.abs(data[Object.keys(data)[1]]) * mu2})
                } else {
                  finalData[insert].y += Math.abs(data[Object.keys(data)[1]]) * mu2
                }
              }
            } else {
              let insert = 0
              for (let data of r[set]) {
                while (insert < finalData.length && data.time > finalData[insert].x) {
                  insert++
                }
                if (insert === finalData.length) {
                  finalData.push({x: data.time, y: (data[Object.keys(data)[1]]) * multiplier})
                } else {
                  finalData[insert].y += (data[Object.keys(data)[1]]) * multiplier
                }
              }
            }
          }
          if (block.charts[chartIndex].point === 'accumulated_real' || block.charts[chartIndex].point === 'total' || block.charts[chartIndex].point === 'cubic_feet') {
            for (let i = finalData.length - 1; i > 0; i--) {
              finalData[i].y -= finalData[i - 1].y
            }
          }
          finalData.splice(0, 1)
          block.charts[chartIndex].data = finalData
          return Promise.resolve()
        })())
      }
      await Promise.all(morePromises)

      context.commit('loadBlock', block)
      return Promise.resolve(block)
    } catch (error) {
      return Promise.reject(error)
    }
  },

<<<<<<< HEAD
  user: async (context) => {
=======
  user: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      if (context.getters.user.name !== '') {
        return Promise.resolve(context.getters.user)
      } else {
        let user = await api.user()
        context.commit('loadUser', user)
        return Promise.resolve(context.getters.user)
      }
    } catch (error) {
      context.commit('loadUser', { name: '', privilige: 0, id: null })
      return Promise.resolve(context.getters.user)
    }
  },

  addChart: async (context, payload) => {
    try {
      const l = context.getters.story.blocks[payload.index].charts.length
      context.commit('loadChart', {
        blockIndex: payload.index,
        chartIndex: l,
        data: {
          name: payload.name,
          group_id: payload.group,
          point: payload.point,
          meter: payload.meter,
          meters: payload.meters
        }
      })
      await context.dispatch('block', { index: payload.index })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Server side create/update/delete actions
  // GROUP
  createGroup: async (context, payload) => {
    try {
      let group = await api.group({ name: payload.name }, 'post')
      context.commit('addGroup', { group: payload.name, id: group.id, stories: [] })
      return Promise.resolve(group.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateGroup: async (context, payload) => {
    try {
      await api.group({ name: payload.name, id: payload.id }, 'put')
      context.commit('updateGroup', { name: payload.name, id: payload.id })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteGroup: async (context, payload) => {
    try {
      await api.group({ id: payload.id }, 'delete')
      context.commit('deleteGroup', { id: payload.id })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  // STORY
  createStory: async (context, payload) => {
    try {
      let story = await api.story(null, payload, 'post')
      payload.id = story.id
      context.commit('addStory', payload)
      return Promise.resolve(story.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateStory: async (context, payload) => {
    try {
      context.commit('updateStory', payload)
      await api.story(null, payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteStory: async (context, payload) => {
    try {
      context.commit('deleteStory', payload)
      await api.story(null, payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  createBlock: async (context, payload) => {
    try {
      let block = await api.block(payload, 'post')
      context.commit('setBlockId', { index: payload.index, id: block.id })
      return Promise.resolve(block.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateBlock: async (context, payload) => {
    try {
      await api.block(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteBlock: async (context, payload) => {
    try {
      await api.block(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  createChart: async (context, payload) => {
    try {
      let chart = await api.chart(payload, 'post')
      context.commit('setChartId', { block_index: payload.index, chart_index: payload.chartIndex, id: chart.id })
      return Promise.resolve(chart.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateChart: async (context, payload) => {
    try {
      await api.chart(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteChart: async (context, payload) => {
    try {
      await api.chart(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // COMMANDS THAT DONT DO ANYTHING TO THE STORE
<<<<<<< HEAD
  mapdata: async () => {
=======
  mapdata: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      return Promise.resolve(await api.mapData())
    } catch (error) {
      return Promise.reject(error)
    }
  },
<<<<<<< HEAD
  media: async () => {
=======
  media: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      return Promise.resolve(await api.media())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  buildingMeters: async (context, payload) => {
    try {
      return Promise.resolve(await api.meters(payload.id))
    } catch (error) {
      return Promise.reject(error)
    }
  },
<<<<<<< HEAD
  metersByBuilding: async () => {
=======
  metersByBuilding: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      let meters = await api.metersByBuilding()
      let returnedObject = {}
      for (let meter of meters) {
        if (!returnedObject[meter.building_name]) {
          returnedObject[meter.building_name] = [{ id: meter.id, name: meter.meter_name }]
        } else {
          returnedObject[meter.building_name].push({ id: meter.id, name: meter.meter_name })
        }
      }
      return Promise.resolve(returnedObject)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  meterPoints: async (context, payload) => {
    try {
<<<<<<< HEAD
      return Promise.resolve(await api.meterPoints(payload.id))
=======
      return Promise.resolve(await api.meterpoints(payload.id))
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    } catch (error) {
      return Promise.reject(error)
    }
  },
<<<<<<< HEAD
  alerts: async () => {
=======
  alerts: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      return Promise.resolve(await api.alerts())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  newAlert: async (context, payload) => {
    try {
      let alert = await api.alert(payload, 'post')
      return Promise.resolve(alert.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateAlert: async (context, payload) => {
    try {
      await api.alert(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteAlert: async (context, payload) => {
    try {
      await api.alert(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
<<<<<<< HEAD
  logout: async (context) => {
=======
  logout: async (context, payload) => {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
    try {
      let link = await api.logout()
      context.commit('loadUser', { name: '', privilege: 0, id: null })
      window.location.replace(link.url)
      // Technically I think this is unreachable code...
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
