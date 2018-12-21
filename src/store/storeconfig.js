/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:36:08-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-20T15:50:27-08:00
 */
import getters from './getters.js'
import mutations from './mutations.js'
import actions from './actions.js'

export default function createStore () {
  const state = {
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
  }

  return {
    state,
    getters,
    mutations,
    actions
  }
}
