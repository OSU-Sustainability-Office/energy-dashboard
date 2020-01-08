/*
 * @Author: Brogan
 * @Date:   Wednesday September 25th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Wednesday September 25th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

import API from './api.js'
import View from './view.module.js'

const state = () => {
  return {
    onid: '',
    privilege: 0,
    views: [],
    alerts: [],
    promise: null,
    path: 'user'
  }
}

const actions = {

  async loadViews (store, views) {
    // let promises = []
    for (let view of views) {
      let viewSpace = 'view_' + view.id
      let moduleSpace = store.getters.path + '/' + viewSpace
      console.log(moduleSpace)
      this.registerModule(moduleSpace.split('/'), View)
      store.commit(viewSpace + '/path', moduleSpace)
      let userViewPromise = store.dispatch(viewSpace + '/loadBlocks', view.blocks)
      store.commit(viewSpace + '/promise', userViewPromise)

      store.commit(viewSpace + '/name', view.name)
      store.commit(viewSpace + '/media', view.media)
      store.commit(viewSpace + '/id', view.id)
    }
    // await Promise.all(promises)
  },

  async user (store) {
    try {
      let data = await API.user()
      if (data.onid !== '') {
        store.commit('onid', data.onid)
        let edashData = await API.edashUser(data.onid)
        store.commit('privilege', edashData.privilege)
        await store.dispatch('loadViews', edashData.appData['energyDashboard'].views)
        // store.commit('alerts', edashData.alerts)
      }
    } catch (error) {
      // Do nothing, likely failed because no cookie has been made yet (user not logged in)
    }
    return store.getters
  },

  async logout (store) {
    store.commit('onid', '')
    store.commit('privilege', 0)
  }
}

const mutations = {

  onid (state, onid) {
    state.onid = onid
  },

  privilege (state, privilege) {
    state.privilege = privilege
  },

  views (state, views) {
    state.views = views
  },

  alerts (state, alerts) {
    state.alerts = alerts
  },

  promise (state, promise) {
    state.promise = promise
  }
}

const getters = {
  onid (state) {
    return state.onid
  },

  promise (state) {
    return state.promise
  },

  privilege (state) {
    return state.privilege
  },

  views (state) {
    return state.views
  },

  alerts (state) {
    return state.alerts
  },

  path (state) {
    return state.path
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
