/**
  Filename: user.module.js
  Info: This vuex module handles user session data on the front-end.
*/
import API from './api.js'
import View from './view.module.js'

const state = () => {
  return {
    onid: '',
    privilege: 0,
    promise: null,
    path: 'user'
  }
}

const actions = {

  async loadViews (store, views) {
    let promises = []
    for (let view of views) {
      let viewSpace = 'view_' + view.id
      let moduleSpace = store.getters.path + '/' + viewSpace
      this.registerModule(moduleSpace.split('/'), View)
      store.commit(viewSpace + '/path', moduleSpace)
      let userViewPromise = store.dispatch(viewSpace + '/loadBlocks', view.blocks)
      store.commit(viewSpace + '/promise', userViewPromise)
      promises.push(userViewPromise)
      store.commit(viewSpace + '/name', view.name)
      store.commit(viewSpace + '/image', view.media)
      store.commit(viewSpace + '/id', view.id)
      store.commit(viewSpace + '/user', store.getters.onid)
    }
    await Promise.all(promises)
  },

  async newView (store, payload) {
    let id = (await API.view(null, { media: payload.media, name: payload.name }, 'post')).id
    let viewSpace = 'view_' + id
    let moduleSpace = store.getters.path + '/' + viewSpace
    this.registerModule(moduleSpace.split('/'), View)
    store.commit(viewSpace + '/path', moduleSpace)
    store.commit(viewSpace + '/name', payload.name)
    store.commit(viewSpace + '/image', payload.media)
    store.commit(viewSpace + '/id', id)
  },

  async deleteView (store, id) {
    let view = store.getters.view(id)
    await this.dispatch(view.path + '/delete')
    this.unregisterModule(view.path.split('/'))
  },

  async user (store) {
    if (store.getters.promise === null) {
      store.commit('promise', new Promise(async (resolve, reject) => {
        try {
          let data = await API.user()
          if (data.onid !== '') {
            store.commit('onid', data.onid)
            let edashData = await API.edashUser()
            store.commit('privilege', edashData.privilege)
            await store.dispatch('loadViews', edashData.appData['energyDashboard'].views)
            // store.commit('alerts', edashData.alerts)
          }
          resolve(store.getters)
        } catch (error) {
          reject(error)
          // Do nothing, likely failed because no cookie has been made yet (user not logged in)
        }
      }))
    }
    return store.getters.promise
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

  view: (state) => (id) => {
    let r = {}
    for (let key of Object.keys(state)) {
      if (key.search(/view_[0-9]+/) >= 0) {
        r[key.replace('view_', '')] = state[key]
      }
    }
    return r[id]
  },

  promise (state) {
    return state.promise
  },

  privilege (state) {
    return state.privilege
  },

  views (state) {
    let r = []
    for (let key of Object.keys(state)) {
      if (key.search(/view_[0-9]+/) >= 0) {
        r.push(state[key])
      }
    }
    return r
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
