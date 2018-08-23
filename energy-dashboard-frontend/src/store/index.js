import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentStory: {
      name: '',
      id: null,
      description: '',
      public: false,
      media: '',
      blocks: []
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
    loadStory: (state, payload) => {
      state.currentStory = payload
    },
    loadStories: (state, payload) => {
      state.stories = payload
    },
    loadUser: (state, payload) => {
      state.user = payload
    },
    loadBlock: (state, payload) => {
      state.currentStory.blocks[parseInt(payload.index)] = payload
    },
    loadChart: (state, payload) => {
      state.currentStory.blocks[payload.blockIndex].charts[payload.chartIndex] = payload.data
    },
    loadData: (state, payload) => {
      state.currentStory.blocks[payload.blockIndex].charts[payload.chartIndex].data = payload.data
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
              if (!master.find(elm => { return elm.group === row.group_name })) {
                master.push({ group: row.group_name, stories: [ row ], public: row.group_public })
              } else {
                master.find(elm => { return elm.group === row.group_name }).stories.push(row)
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

    block: (context, payload) => {
      return new Promise((resolve, reject) => {
        let promises = []
        if (payload.index === null) {
          reject(new Error('Block action needs index'))
        }
        var block = context.getters.block(payload.index)
        for (let blockKey of Object.keys(payload)) {
          block[blockKey] = payload[blockKey]
        }
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
                  elm.value += v
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
          resolve(context.getters.user)
        } else {
          axios(process.env.ROOT_API + 'api/user', { method: 'get', data: null, withCredentials: true }).then(res => {
            context.commit('loadUser', res.data)
            resolve(context.getters.user)
          }).catch(e => {
            reject(e)
          })
        }
      })
    }
  }
})
