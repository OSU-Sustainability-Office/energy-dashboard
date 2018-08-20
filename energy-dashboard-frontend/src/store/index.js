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
      return state.currentStory
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
      state.currentStory.blocks[payload.index] = payload.block
    },
    loadChart: (state, payload) => {
      state.currentStory.blocks[payload.blockIndex].charts[payload.chartIndex] = payload.data
    },
    loadData: (state, payload) => {
      state.currentStory.blocks[payload.blockIndex].charts[payload.chartIndex].data = payload.data
    }
  },
  actions: {

    story: (context, index) => {
      return new Promise((resolve, reject) => {
        if (index === context.getters.currentStory.index) {
          resolve(context.getters.currentStory)
        } else {
          axios(process.env.ROOT_API + 'api/story?id=' + index, { method: 'get', data: null, withCredentials: true }).then(res => {
            context.commit('loadStory', res.data)
            resolve(context.getters.currentStory)
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
            context.commit('loadStories', res.data)
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
        if (!payload.index) {
          reject(new Error('Block acion needs index'))
        }
        let block = context.getters.block(payload.index)
        for (let blockKey of Object.keys(payload)) {
          block[blockKey] = payload[blockKey]
        }
        for (let chartIndex in block.charts) {
          let paramString = '?id=' + block.id + '&startDate='
          promises.push(axios(process.env.ROOT_API + 'api/data' + paramString, { method: 'get', data: null, withCredentials: true }).then(res => {
            let initial = res.data[0]
            for (let i = 1; i < res.data.length; i++) {
              for (let obj of res.data[i]) {
                let value = obj[Object.keys(obj)[0]]
                if (block.meters[i].operation === 1) {
                  value *= -1
                }
                initial[Object.keys(obj)[0]] += value
              }
            }
            let master = []
            for (let obj of initial) {
              master.push({ time: Object.keys(obj)[0], value: obj[Object.keys(obj)[0]] })
            }
            block.charts[chartIndex].data = master
          }))
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
