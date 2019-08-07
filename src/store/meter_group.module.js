/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from './api.js'
import Meter from './meter.module.js'

const state = () => {
  return {
    id: null,     // Integer DB ID
    name: null    // String
  }
}

const actions = {

  async changeGroup (store, id) {
    let group = await API.meter_group(id)
    store.commit('id', id)
    for (let meterId of group.meters) {
      store.registerModule(meterId, Meter)
      store.dispatch(meterId + '/changeMeter', meterId)
    }
  },

  async getData (store, payload) {
    let resultDataObject = new Map()
    if (payload.point !== 'accumulated_real' && payload.point !== 'total' && payload.point !== 'cubic_feet' && Object.values(store.modules).length > 1) {
      /*
        To decide if this should allow more points later, but there are a lot that do not make sense or can not be directly added together
      */
      throw new Error('Can not add together non-total metering points')
    }
    for (let meter of Object.values(store.modules)) {
      let data = await meter.dispatch('getData', payload)
      for (let dataPoint of data) {
        if (resultDataObject[dataPoint['time']]) {
          if (meter.getters.negate) {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) - dataPoint[payload.point])
          } else {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) + dataPoint[payload.point])
          }
        } else {
          resultDataObject.set(dataPoint['time'], dataPoint[payload.point])
        }
      }
    }
    if (payload.point === 'accumulated_real' && payload.point === 'total' && payload.point === 'cubic_feet') {
      let startTime = resultDataObject.values()[0]['time']
      let endTime = resultDataObject.values()[resultDataObject.size - 1]['time']
      for (let i = endTime - 900; i >= startTime; i -= 900) {
        let currentIndex = i + 900
        let nextValidValue = null
        while (nextValidValue === null) {
          try {
            nextValidValue = resultDataObject.get(i)
            if (nextValidValue === 0) {
              nextValidValue = null
            }
          } catch {
            nextValidValue = null
            resultDataObject.set(i, 0)
            i -= 900
          }
        }
        resultDataObject.set(currentIndex, resultDataObject.get(currentIndex) - resultDataObject.get(i))
      }
    }
  }
}

const mutations = {
  name (state, name) {
    state.name = name
  },

  id (state, id) {
    state.id = id
  }

}

const getters = {
  name (state) {
    return state.name
  },

  id (state) {
    return state.id
  }
}

const modules = { }

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
