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
    promise: null,
    type: null,
    building: null
  }
}

const actions = {

  async changeGroup (store, payload) {
    let group = API.meterGroup(payload.id)
    let wait = true
    store.commit('promise', new Promise((resolve, reject) => {
      let fn = () => {
        if (wait) {
          setTimeout(fn, 100)
        } else {
          resolve()
        }
      }
      fn()
    }))
    group = await group
    store.commit('id', payload.id)
    store.commit('name', group.name)
    store.commit('default', group.default)
    for (let meterId of group.meters) {
      let meterSpace = 'meter_' + meterId.toString()
      let moduleSpace = store.getters.path + '/' + meterSpace
      this.registerModule(moduleSpace.split('/'), Meter)
      store.commit(meterSpace + '/path', moduleSpace)
      store.dispatch(meterSpace + '/changeMeter', meterId).then(meter => {
        store.commit('type', meter.type)
      })
    }
    wait = false
    return store.state
  },

  async loadMeter (store, meter) {
    let meterSpace = 'meter_' + meter.id.toString()
    let moduleSpace = store.getters.path + '/' + meterSpace
    this.registerModule(moduleSpace.split('/'), Meter)
    store.commit(meterSpace + '/path', moduleSpace)
    store.commit(meterSpace + '/id', meter.id)
    store.commit(meterSpace + '/name', meter.name)
    store.commit(meterSpace + '/address', meter.address)
    store.commit(meterSpace + '/classInt', meter.classInt)
    store.commit(meterSpace + '/negate', meter.negate)
    store.commit(meterSpace + '/type', meter.type)
    store.commit(meterSpace + '/points', meter.points)
  },

  async getData (store, payload) {
    let resultDataObject = new Map()
    if (payload.point !== 'accumulated_real' && payload.point !== 'total' && payload.point !== 'cubic_feet') { // && store.getters.meters.length > 1) {
      /*
        To decide if this should allow more points later, but there are a lot that do not make sense or can not be directly added together
      */
      // Tesla Solar Panel Support
      if (payload.point === 'total_energy') {
        payload.dateStart = payload.dateStart - (payload.dateStart % 900)
        payload.dateEnd = payload.dateEnd  - (payload.dateEnd % 900)
        let promiseObject = {}
        for (let meter of store.getters.meters) {
          let promise = this.dispatch(meter.path + '/getData', payload)
          promiseObject[meter.id] = promise
        }
        for (let meter of store.getters.meters) {
          let data = await promiseObject[meter.id]
          // For some reason if the array is empty it sometimes forgets it is an array
          if (!Array.isArray(data) || data.length === 0) {
            continue
          }
          // move object -> map
          for (let dataPoint of data) {
            resultDataObject.set(dataPoint['time'], dataPoint[payload.point])
          }
        }
        return resultDataObject
      }

      throw new Error('Can not add together non-total metering points')
    }

    payload.dateStart = payload.dateStart - (payload.dateStart % 900)
    payload.dateEnd = payload.dateEnd  - (payload.dateEnd % 900)

    let promiseObject = {}
    for (let meter of store.getters.meters) {
      let promise = this.dispatch(meter.path + '/getData', payload)
      promiseObject[meter.id] = promise
    }
    for (let meter of store.getters.meters) {
      let data = await promiseObject[meter.id]
      // For some reason if the array is empty it sometimes forgets it is an array
      if (!Array.isArray(data) || data.length === 0) {
        continue
      }
      for (let dataPoint of data) {
        if (resultDataObject.get(dataPoint['time'])) {
          if (meter.negate) {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) - dataPoint[payload.point])
          } else {
            resultDataObject.set(dataPoint['time'], resultDataObject.get(dataPoint['time']) + dataPoint[payload.point])
          }
        } else {
          resultDataObject.set(dataPoint['time'], dataPoint[payload.point] * ((meter.negate) ? -1 : 1))
        }
      }
    }
    console.log("here's the data object")
    console.log(resultDataObject)
    return resultDataObject
  }
}

const mutations = {
  path (state, path) {
    state.path = path
  },

  building (state, building) {
    state.building = building
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
  },

  type (state, value) {
    state.type = value
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

  building (state) {
    return state.building
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

  type (state) {
    return state.type
  },

  points (state) {
    let r = []
    for (let c of Object.keys(state)) {
      if (c.search(/meter_/) >= 0) {
        r.push(state[c])
      }
    }
    if (r.length > 1) {
      // Need to change this incase steam meters are grouped etc
      return [{ label: 'Net Energy Usage (kWh)', value: 'accumulated_real' }]
    } else {
      return r[0].points
    }
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
