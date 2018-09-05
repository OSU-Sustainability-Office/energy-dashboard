import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    currentStory: {
      name: '',
      id: null,
      description: '',
      public: false,
      media: '',
      blocks: [],
      modified: false,
      removed: []
    },
    stories: [],
    user: {
      name: '',
      privilege: 0
    }
  },
  getters: {
    story: state => {
      return state.currentStory
    },
    user: state => {
      return state.user
    },
    stories: state => {
      return state.stories
    },
    block: state => index => {
      return state.currentStory.blocks[index]
    },
    chart: state => (blockIndex, chartIndex) => {
      return state.currentStory.blocks[blockIndex].charts[chartIndex]
    },
    data: state => (blockIndex, chartIndex) => {
      return state.currentStory.blocks[blockIndex].charts[chartIndex].data
    }
  },
  mutations: {
    resetRemoved: (state, payload) => {
      state.currentStory.removed = []
    },
    loadStory: (state, payload) => {
      state.currentStory = payload
      state.currentStory.modified = false
      state.currentStory.removed = []
    },
    loadStories: (state, payload) => {
      state.stories = payload
    },
    addGroup: (state, payload) => {
      state.stories.push(payload)
    },
    deleteGroup: (state, payload) => {
      state.stories.splice(state.stories.map(e => { return e.id }).indexOf(payload.id), 1)
    },
    updateGroup: (state, payload) => {
      state.stories.find(el => el.id === payload.id).group = payload.name
    },
    addStory: (state, payload) => {
      state.stories.find(el => el.id === payload.group_id).stories.push(payload)
    },
    updateStory: (state, payload) => {
      const story = state.stories.find(el => el.id === payload.group_id).stories.find(el => el.id === payload.id)

      story.name = payload.name
      story.description = payload.description
      story.media = payload.media
    },
    deleteStory: (state, payload) => {
      const stories = state.stories.find(el => el.id === payload.group_id).stories
      stories.splice(stories.map(el => { return el.id }).indexOf(payload.id), 1)
    },
    loadUser: (state, payload) => {
      state.user = payload
      // Reset Stories, if a  user logins in their personal stories need to be accesible
      if (payload.name !== '') {
        state.stories = []
      }
    },
    loadBlock: (state, payload) => {
      Vue.set(state.currentStory.blocks, parseInt(payload.index), payload)
    },
    changeBlockName: (state, payload) => {
      state.currentStory.blocks[payload.index].name = payload.name
    },
    setBlockId: (state, payload) => {
      state.currentStory.blocks[payload.index].id = payload.id
    },
    removeBlock: (state, payload) => {
      let r = state.currentStory.blocks.splice(payload.index, 1)[0]
      if (r.id) {
        state.currentStory.removed.push({ id: r.id, type: 'block' })
      }
    },
    loadChart: (state, payload) => {
      Vue.set(state.currentStory.blocks[payload.blockIndex].charts, payload.chartIndex, payload.data)
    },
    setChartId: (state, payload) => {
      state.currentStory.blocks[payload.block_index].charts[payload.chart_index] = payload.id
    },
    removeChart: (state, payload) => {
      let r = state.currentStory.blocks[payload.blockIndex].charts.splice(payload.index, 1)[0]
      if (r.id) {
        state.currentStory.removed.push({ id: r.id, type: 'chart' })
      }
    },
    loadData: (state, payload) => {
      state.currentStory.blocks[payload.blockIndex].charts[payload.chartIndex].data = payload.data
    },
    modifyFlag: (state, payload) => {
      state.currentStory.modified = true
      if (payload !== undefined) {
        state.currentStory.modified = payload
      }
    }
  },
  actions: {

    story: (context, id) => {
      return new Promise((resolve, reject) => {
        if (context.getters.currentStory && id === context.getters.currentStory.id) {
          resolve(context.getters.currentStory)
        } else {
          axios(process.env.ROOT_API + 'api/story?id=' + id, { method: 'get', data: null, withCredentials: true }).then(res => {
            let story = res.data
            for (let chart of story.openCharts) {
              let b = story.blocks.find(el => el.id === chart.block_id)
              // First put meters into charts
              for (let meter of story.openMeters) {
                if ((chart.meter === 0 || chart.meter === meter.meter_id) && meter.chart_id === chart.id) {
                  if (chart.meters) {
                    chart.meters.push(meter)
                    story.openMeters.splice(story.openMeters.indexOf(meter), 1)
                  } else {
                    chart.meters = [meter]
                  }
                }
              }
              // Then put charts into blocks & clean boy
              delete chart.meter
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
            let blockPromises = []
            for (let b in context.getters.story.blocks) {
              blockPromises.push(context.dispatch('block', { index: b }))
            }
            Promise.all(blockPromises).then(() => {
              resolve(context.getters.story)
            }).catch(e => {
              throw e
            })
          }).catch(e => {
            reject(e)
          })
        }
      })
    },

    stories: (context) => {
      return new Promise((resolve, reject) => {
        if (context.getters.stories.length > 0) {
          resolve(context.getters.stories)
        } else {
          axios(process.env.ROOT_API + 'api/stories', { method: 'get', data: null, withCredentials: true }).then(res => {
            let master = []
            for (let row of res.data) {
              if (!master.find(elm => { return elm.id === row.group_id })) {
                master.push({ group: row.group_name, stories: [ row ], public: row.group_public, id: row.group_id })
              } else {
                master.find(elm => { return elm.id === row.group_id }).stories.push(row)
              }
            }
            context.commit('loadStories', master)
            resolve(context.getters.stories)
          }).catch(e => {
            reject(e)
          })
        }
      })
    },

    buildings: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + 'api/buildings', { method: 'get', data: null, withCredentials: true }).then(res => {
          resolve(res.data)
        }).catch(e => { reject(e) })
      })
    },

    building: (context, payload) => {
      return new Promise((resolve, reject) => {
        if (payload.blockIndex === null || payload.chartIndex === null || context.getters.story.blocks.length < payload.blockIndex || context.getters.story.blocks[payload.blockIndex].charts.length < payload.chartIndex) {
          reject(new Error('Building action needs existing chart and block index'))
        }
        if (!payload.group_id) {
          reject(new Error('Building action needs group id'))
        }
        axios.get(process.env.ROOT_API + 'api/meters?id=' + payload.group_id, { method: 'get', data: null, withCredentials: true }).then(res => {
          context.dispatch('block', { index: payload.blockIndex, charts: [{ index: payload.chartIndex, group_id: payload.group_id, meters: res.data }] }).then(() => {
            resolve(context.getters.block(payload.blockIndex))
          }).catch(e => {
            throw e
          })
        }).catch(e => reject(e))
      })
    },

    block: (context, payload) => {
      return new Promise((resolve, reject) => {
        let promises = []

        if (payload.index === null) {
          reject(new Error('Block action needs index'))
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
        // Aqquire new data for the charts since they were manipulated
        for (let chartIndex in block.charts) {
          let chartData = []
          for (let meter of block.charts[chartIndex].meters) {
            let paramString = '?id=' + meter.meter_id + '&startDate=' + block.date_start + '&endDate=' + block.date_end + '&point=' + block.charts[chartIndex].point
            promises.push(axios(process.env.ROOT_API + 'api/data' + paramString, { method: 'get', data: null, withCredentials: true }).then(res => {
              for (let entry of res.data) {
                let elm = chartData.find(elm => elm.x === entry.time)
                let v = Math.abs(entry[Object.keys(entry)[1]])
                if (elm) {
                  if (meter.operation === 0) {
                    v *= -1
                  }
                  elm.y += v
                } else {
                  chartData.push({ x: entry.time, y: v })
                }
              }
              // This will run for every meter, although it runs more than it should, it should not be a problem
              block.charts[chartIndex].data = chartData
            }))
          }
        }
        Promise.all(promises).then(() => {
          context.commit('loadBlock', block)
          resolve(context.getters.block(payload.index))
        }).catch(e => {
          reject(e)
        })
      })
    },

    user: (context, payload) => {
      return new Promise((resolve, reject) => {
        if (context.getters.user.name !== '') {
          resolve(context.getters)
        } else {
          axios(process.env.ROOT_API + 'api/user', { method: 'get', data: null, withCredentials: true }).then(res => {
            context.commit('loadUser', res.data)
            resolve(context.getters.user)
          }).catch(e => {
            context.commit('loadUser', { name: '', privilige: 0, id: null })
            resolve(context.getters.user)
          })
        }
      })
    },

    addChart: (context, payload) => {
      return new Promise((resolve, reject) => {
        const l = context.getters.story.blocks[payload.index].charts.length
        context.commit('loadChart', {
          blockIndex: payload.index,
          chartIndex: l,
          data: {
            name: 'New Chart',
            group_id: 9,
            point: 'accumulated_real',
            meters: [
              { meter_id: 8, operation: 1 },
              { meter_id: 9, operation: 1 }
            ]
          }
        })
        context.dispatch('block', { index: payload.index }).then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },

    // Server side create/update/delete actions
    // GROUP
    createGroup: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/group', { method: 'post', data: { name: payload.name }, withCredentials: true }).then(res => {
          payload.id = res.data.id
          context.commit('addGroup', { group: payload.name, id: payload.id, stories: [] })
          resolve(res.data.id)
        }).catch(e => {
          reject(e)
        })
      })
    },
    updateGroup: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/group', { method: 'put', data: { name: payload.name, id: payload.id }, withCredentials: true }).then(res => {
          context.commit('updateGroup', { name: payload.name, id: payload.id })
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteGroup: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/group', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          context.commit('deleteGroup', { id: payload.id })
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    // STORY
    createStory: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/story', { method: 'post', data: payload, withCredentials: true }).then(res => {
          payload.id = res.data.id
          context.commit('addStory', payload)
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    updateStory: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('updateStory', payload)
        axios(process.env.ROOT_API + 'api/story', { method: 'put', data: payload, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteStory: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('deleteStory', payload)
        axios(process.env.ROOT_API + 'api/story', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    createBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios(process.env.ROOT_API + 'api/block', { method: 'post', data: { date_start: payload.date_start, date_end: payload.date_end, graph_type: payload.graph_type, story_id: payload.story_id, name: payload.name, date_interval: payload.date_interval, interval_unit: payload.interval_unit }, withCredentials: true }).then(res => {
          context.commit('setBlockId', { index: payload.index, id: res.data.id })
          resolve(res.data.id)
        }).catch(e => {
          reject(e)
        })
      })
    },
    updateBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/block', { method: 'put', data: { id: payload.id, date_start: payload.date_start, date_end: payload.date_end, graph_type: payload.graph_type, story_id: payload.story_id, name: payload.name, date_interval: payload.date_interval, interval_unit: payload.interval_unit }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + 'api/block', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    createChart: (context, payload) => {
      return new Promise((resolve, reject) => {
        let meter = 0
        if (payload.meters.length === 1) {
          meter = payload.meters[0].meter_id
        }
        axios(process.env.ROOT_API + 'api/chart', { method: 'post', data: { block_id: payload.block_id, group_id: payload.group_id, name: payload.name, point: payload.point, meter: meter }, withCredentials: true }).then(res => {
          context.commit('setChartId', { block_index: payload.index, chart_index: payload.chartIndex, id: res.data.id })
          resolve(res.data.id)
        }).catch(e => {
          reject(e)
        })
      })
    },
    updateChart: (context, payload) => {
      return new Promise((resolve, reject) => {
        let meter = 0
        if (payload.meters.length === 1) {
          meter = payload.meters[0].meter_id
        }
        axios(process.env.ROOT_API + 'api/chart', { method: 'put', data: { id: payload.id, group_id: payload.group_id, name: payload.name, point: payload.point, meter: meter }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteChart: (context, payload) => {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios(process.env.ROOT_API + 'api/chart', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },

    // COMMANDS THAT DONT DO ANYTHING TO THE STORE
    mapdata: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + 'api/map').then(res => {
          resolve(res.data)
        }).catch(e => {
          reject(e)
        })
      })
    },
    media: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + 'api/media').then(val => {
          resolve(val.data)
        }).catch(e => {
          reject(e)
        })
      })
    }
  }
})
