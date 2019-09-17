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
    name: null,    // String
    default: false,
    path: null,
    promise: null
  }
}

const actions = {

  async changeGroup (store, payload) {
    let group = API.meterGroup(payload.id)
    store.commit('promise', group)
    group = await group
    store.commit('id', payload.id)
    store.commit('name', group.name)
    store.commit('default', group.default)
    for (let meterId of group.meters) {
      let meterSpace = 'meter_' + meterId.toString()
      let moduleSpace = store.getters.path + '/' + meterSpace
      this.registerModule(moduleSpace.split('/'), Meter)
      store.commit(meterSpace + '/path', moduleSpace)
      store.dispatch(meterSpace + '/changeMeter', meterId)
    }
  },

  async getData (store, payload) {
    let resultDataObject = new Map()
    if (payload.point !== 'accumulated_real' && payload.point !== 'total' && payload.point !== 'cubic_feet' && store.getters.meters.length > 1) {
      /*
        To decide if this should allow more points later, but there are a lot that do not make sense or can not be directly added together
      */
      throw new Error('Can not add together non-total metering points')
    }
    for (let meter of store.getters.meters) {
      let data = await this.dispatch(meter.path + '/getData', payload)
      for (let dataPoint of data) {
        if (resultDataObject[dataPoint['time']]) {
          if (meter.negate) {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) - dataPoint[payload.point])
          } else {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) + dataPoint[payload.point])
          }
        } else {
          resultDataObject.set(dataPoint['time'], dataPoint[payload.point])
        }
      }
    }
    if (payload.point === 'accumulated_real' || payload.point === 'total' || payload.point === 'cubic_feet') {
      let startTime = Array.from(resultDataObject.keys())[0]
      let endTime = Array.from(resultDataObject.keys())[resultDataObject.size - 1]
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
    let delta = 1
    switch (payload.intervalUnit) {
      case 'minute':
        delta = 1
        break
      case 'hour':
        delta = 4
        break
      case 'day':
        delta = 96
        break
    }
    if (payload.intervalUnit === 'minute') {
      payload.dateInterval /= 15
    }
    delta *= payload.dateInterval
    let returnData = []
    let accumulator = 0
    // Leave out first point as it contains non subtracted data for totals
    for (let i = resultDataObject.size - 1; i > 0; i--) {
      accumulator += Array.from(resultDataObject.values())[i]
      if (i % delta === 0) {
        returnData.push({ x: (new Date(Array.from(resultDataObject.keys())[i] * 1000)), y: accumulator })
        accumulator = 0
      }
    }
    return returnData
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },

  promise (state, promise) {
    state.promise = promise
  },

  name (state, name) {
    state.name = name
  },

  id (state, id) {
    state.id = id
  },

  default (state, value) {
    state.default = value
  }

}

const getters = {
  path (state) {
    return state.path
  },

  promise (state) {
    return state.promise
  },

  name (state) {
    return state.name
  },

  id (state) {
    return state.id
  },

  meters (state) {
    let r = []
    for (let c of Object.keys(state)) {
      if (c.search(/meter_/) >= 0) {
        r.push(state[c])
      }
    }
    return r
  },

  default (state) {
    return state.default
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
