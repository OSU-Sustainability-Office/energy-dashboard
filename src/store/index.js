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
      // Reset Stories, if a  user logins in their personal stories need to be accesible
      if (payload.name !== state.user.name) {
        state.stories = []
      }
      state.user = payload
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
      let r = state.currentStory.blocks[payload.blockIndex].charts.splice(payload.chartIndex, 1)[0]
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
          axios(process.env.ROOT_API + '/energy/story?id=' + id, { method: 'get', data: null, withCredentials: true }).then(res => {
            let story = res.data
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
          axios(process.env.ROOT_API + '/energy/stories', { method: 'get', data: null, withCredentials: true }).then(res => {
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
        axios.get(process.env.ROOT_API + '/energy/buildings', { method: 'get', data: null, withCredentials: true }).then(res => {
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
        axios.get(process.env.ROOT_API + '/energy/meters?id=' + payload.group_id, { method: 'get', data: null, withCredentials: true }).then(res => {
          let r = []
          for (let meter of res.data) {
            if (meter.type === 'e') {
              r.push(meter)
            }
          }
          context.dispatch('block', { index: payload.blockIndex, charts: [{ index: payload.chartIndex, group_id: payload.group_id, meters: r, point: 'accumulated_real' }] }).then(() => {
            resolve(context.getters.block(payload.blockIndex))
          }).catch(e => {
            throw e
          })
        }).catch(e => reject(e))
      })
    },

    block: (context, payload) => {
      return new Promise((resolve, reject) => {
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
        let morePromises = []
        // Aqquire new data for the charts since they were manipulated
        for (let chartIndex in block.charts) {
          morePromises.push(new Promise((resolve, reject) => {
            let chartPromises = []
            for (let meter of block.charts[chartIndex].meters) {
              let start = new Date(block.date_start)
              start.setTime(start.getTime() + start.getTimezoneOffset() * 60 * 1000)
              let end = new Date(block.date_end)
              end.setTime(end.getTime() + end.getTimezoneOffset() * 60 * 1000)
              const paramString = '?id=' + meter.meter_id + '&startDate=' + start.toISOString() + '&endDate=' + end.toISOString() + '&point=' + block.charts[chartIndex].point
              chartPromises.push(axios(process.env.ROOT_API + '/energy/data' + paramString, { method: 'get', data: null, withCredentials: true }))
            }
            Promise.all(chartPromises).then((r) => {
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
                if (!r[set].data || r[set].data.length <= 0) {
                  // If we dont get any data in the set skip to the next set
                  continue
                }
                // get multiplier for oddly hooked up meters for points that can be negative
                const multiplier = ((block.charts[chartIndex].meters[set].negate) ? -1 : 1) * (map[Object.keys(r[set].data[0])[1]] || map['default'])
                // get negation factor for accumulated_real
                let mu2 = (block.charts[chartIndex].meters[set].operation) ? 1 : -1
                if (block.charts[chartIndex].meters.length === 1) {
                  mu2 = 1
                }
                if (multiplier === 0) {
                  let insert = 0
                  for (let data of r[set].data) {
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
                  for (let data of r[set].data) {
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
              block.charts[chartIndex].data = finalData
              resolve()
            }).catch(e => {
              reject(e)
            })
          }))
        }
        Promise.all(morePromises).then(() => {
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
          resolve(context.getters.user)
        } else {
          axios(process.env.ROOT_API + '/energy/user', { method: 'get', data: null, withCredentials: true }).then(res => {
            context.commit('loadUser', res.data)
            resolve(context.getters.user)
          }).catch(e => {
            console.log(e.message)
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
        axios(process.env.ROOT_API + '/energy/group', { method: 'post', data: { name: payload.name }, withCredentials: true }).then(res => {
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
        axios(process.env.ROOT_API + '/energy/group', { method: 'put', data: { name: payload.name, id: payload.id }, withCredentials: true }).then(res => {
          context.commit('updateGroup', { name: payload.name, id: payload.id })
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteGroup: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + '/energy/group', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
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
        axios(process.env.ROOT_API + '/energy/story', { method: 'post', data: payload, withCredentials: true }).then(res => {
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
        axios(process.env.ROOT_API + '/energy/story', { method: 'put', data: payload, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteStory: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('deleteStory', payload)
        axios(process.env.ROOT_API + '/energy/story', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    createBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios(process.env.ROOT_API + '/energy/block', { method: 'post', data: { date_start: payload.date_start, date_end: payload.date_end, graph_type: payload.graph_type, story_id: payload.story_id, name: payload.name, date_interval: payload.date_interval, interval_unit: payload.interval_unit }, withCredentials: true }).then(res => {
          context.commit('setBlockId', { index: payload.index, id: res.data.id })
          resolve(res.data.id)
        }).catch(e => {
          reject(e)
        })
      })
    },
    updateBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + '/energy/block', { method: 'put', data: { id: payload.id, date_start: payload.date_start, date_end: payload.date_end, graph_type: payload.graph_type, story_id: payload.story_id, name: payload.name, date_interval: payload.date_interval, interval_unit: payload.interval_unit }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteBlock: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + '/energy/block', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
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
        axios(process.env.ROOT_API + '/energy/chart', { method: 'post', data: { block_id: payload.block_id, group_id: payload.group_id, name: payload.name, point: payload.point, meter: meter }, withCredentials: true }).then(res => {
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
        axios(process.env.ROOT_API + '/energy/chart', { method: 'put', data: { id: payload.id, group_id: payload.group_id, name: payload.name, point: payload.point, meter: meter }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },
    deleteChart: (context, payload) => {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios(process.env.ROOT_API + '/energy/chart', { method: 'delete', data: { id: payload.id }, withCredentials: true }).then(res => {
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },

    // COMMANDS THAT DONT DO ANYTHING TO THE STORE
    mapdata: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + '/energy/map').then(res => {
          resolve(res.data)
        }).catch(e => {
          reject(e)
        })
      })
    },
    media: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + '/energy/media').then(val => {
          resolve(val.data)
        }).catch(e => {
          reject(e)
        })
      })
    },
    buildingMeters: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios.get(process.env.ROOT_API + '/energy/meters?id=' + payload.id).then(val => {
          resolve(val.data)
        }).catch(e => {
          reject(e)
        })
      })
    },
    logout: (context, payload) => {
      return new Promise((resolve, reject) => {
        axios(process.env.ROOT_API + '/auth/logout', { withCredentials: true }).then(r => {
          if (r.status === 200) {
            context.commit('loadUser', { name: '', privilege: 0, id: null })
            window.location.replace(r.data.url)
          }
        })
      })
    }
  }
})
