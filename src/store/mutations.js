/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:36:17-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-27T12:19:03-08:00
 */

import Vue from 'vue'

export default {
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
}
