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

  async getData (store, payload) {
    let resultDataObject = new Map()
    if (payload.point !== 'accumulated_real' && payload.point !== 'total' && payload.point !== 'cubic_feet' && store.getters.meters.length > 1) {
      /*
        To decide if this should allow more points later, but there are a lot that do not make sense or can not be directly added together
      */
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
    return resultDataObject
    // if (payload.graphType === 1 || payload.graphType === 2 || payload.graphType === 5) {
    //   let delta = 1
    //   switch (payload.intervalUnit) {
    //     case 'minute':
    //       delta = 60
    //       break
    //     case 'hour':
    //       delta = 3600
    //       break
    //     case 'day':
    //       delta = 86400
    //       break
    //   }

    //   delta *= payload.dateInterval
    //   for (let i = payload.dateStart; i <= payload.dateEnd; i += delta) {
    //     try {
    //       let accumulator = 0
    //       if (isNaN(resultDataObject.get(i + delta)) || isNaN(resultDataObject.get(i))) {
    //         continue
    //       }
    //       if (payload.point === 'accumulated_real' || payload.point === 'total' || payload.point === 'cubic_feet') {
    //         accumulator = resultDataObject.get(i + delta) - resultDataObject.get(i)
    //       } else {
    //         accumulator = resultDataObject.get(i + delta)
    //       }
    //       returnData.push({ x: (new Date((i + delta) * 1000)), y: accumulator })
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   }
    // } else if (payload.graphType === 3 || payload.graphType === 4) {
    //   try {
    //     const net = resultDataObject.get(payload.dateEnd) - resultDataObject.get(payload.dateStart)
    //     returnData.push(net)
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }

    // return returnData
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

  points (state) {
    let r = []
    for (let c of Object.keys(state)) {
      if (c.search(/meter_/) >= 0) {
        r.push(state[c])
      }
    }
    if (r.length > 1) {
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
