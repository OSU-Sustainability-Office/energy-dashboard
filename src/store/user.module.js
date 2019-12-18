/*
 * @Author: Brogan
 * @Date:   Wednesday September 25th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Wednesday September 25th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

import API from './api.js'

const state = () => {
  return {
    onid: '',
    privilege: 0,
    views: [],
    alerts: []
  }
}

const actions = {

  async login (store) {
    let data = await API.login()
    if (data.onid !== '') {
      store.commit('onid', data.onid)
      let edashData = await API.edsashUser(data.onid)
      store.commit('privilege', edashData.privilege)
      store.commit('stories', edashData.stories)
      store.commit('alerts', edashData.alerts)
    }
  },

  async user (store) {
    try {
      let data = await API.user()
      if (data.onid !== '') {
        store.commit('onid', data.onid)
        // let edashData = await API.edashUser(data.onid)
        // store.commit('privilege', edashData.privilege)
        // store.commit('stories', edashData.stories)
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
  }
}

const getters = {
  onid (state) {
    return state.onid
  },

  privilege (state) {
    return state.privilege
  },

  views (state) {
    return state.views
  },

  alerts (state) {
    return state.alerts
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
