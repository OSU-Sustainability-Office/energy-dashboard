/*
 * Filename: data_store.js
 * Info:
 *  This file provides a persistent cache for time series energy data. The
 *  goal is to accumulate data in this datastore as the user navigates around the
 *  energy dashboard. As an optimization, data will be read from this datastore
 *  before any additional data is requested from the API.
 *
 *  For example, let's say a user starts a new session and visits the map. Since this user just
 *  started their session, no data will be in the datastore. If the user clicks on the MU, viewing
 *  a week's worth of data from 7/19/2020 thru 7/25/2020, then the MU electricity data will be
 *  written to the datastore.
 *
 *  Now, let's say that same user (in the same session) visits a few more dashbaords
 *  before eventually returning to the MU's dashboard. The user modifies the date
 *  range to view a month of data (from 6/26/2020 to 7/25/2020). Since we already
 *  have data from 7/19-7/25 stored in the local datastore, only the data from
 *  6/26-7/19 will be requested from the API.
 */

import API from '../api.js'

const state = () => {
  return {
    cache:
    {
      // Initially empty
      // Generally has this structure:
      // {
      //   meterId: {
      //     uom: {
      //       Contains instances of the datum class
      //       Each data class instance is keyed with its epoch timestamp
      //     }
      //   }
      // }
    },
    indexedDBInstance: undefined
  }
}

const actions = {

  // Copies "cache" object to indexedDB for persistent storage
  async addCacheToIndexedDB (store) {
    // double-check current store state
    const db = this.getters['dataStore/DB']
    if (db === undefined) throw new Error('indexedDB not instantiated')
    const cache = this.getters['dataStore/cache']
    if (cache.length === 0) throw new Error('cache object is empty')

    // Wrapping each callback into promise so async works on indexedDB api calls
    for (let meterId of Object.keys(cache)) {
      await new Promise((resolve, reject) => {
        let request = db.transaction('MeterReadings', 'readwrite').objectStore('MeterReadings').put({ 'meterId': meterId, 'meterData': { ...cache[meterId] } })
        request.onerror = event => reject(event)
        request.onsuccess = event => resolve(event)
      })
        .catch(err => { throw err })
    }
  },

  // Loads indexedDB into the Vuex store
  // The indexedDB database holds "Object Stores" which hold persistent data within the user's browser.
  // There are currently one defined object store:
  //    MeterReadings -> stores queried meter measurements from the api (persistent cache object)
  //
  // The MeterReadings's structure is pretty similar to the cache:
  //    {
  //      meterId: <id of meter>
  //      meterData: {
  //        uom: {
  //          datetime: accumulated_real (value),
  //          ...
  //        }
  //      }
  //    }

  async loadIndexedDB (store) {
    if (this.getters['dataStore/DB'] !== undefined) return

    // connect to indexedDB instance
    await new Promise((resolve, reject) => {
      const db = window.indexedDB.open('OSU Sustainability Office Energy Dashboard Data Cache', 2)
      db.onerror = event => reject(event)
      // onupgradeneeded will be called if the database does not exist and/or exists with an older version
      db.onupgradeneeded = event => {
        switch (event.oldVersion) {
          // if oldVersion == 0, then indexedDB did not exist so we build it.
          case 0:
            // stores meter readings
            event.target.result.createObjectStore('MeterReadings', { keyPath: 'meterId' })
            break
          // remove dead request store for older indexed database instances
          case 1:
            event.target.result.deleteObjectStore('DeadRequests')
            break
        }
      }
      db.onsuccess = event => resolve(event)
    })
      .then(event => {
        // Store reference to indexDB database in vuex store
        this.commit('dataStore/setDBInstance', { instance: event.target.result })
      })
      .catch(event => {
        console.log('An error occured when trying to use indexedDB API, is it enabled?')
      })

    // Then, load indexedDB into the dataStore's cache object
    let newCacheObject = {}
    await new Promise((resolve, reject) => {
      let dataReqest = this.getters['dataStore/DB'].transaction('MeterReadings', 'readonly').objectStore('MeterReadings').getAll()
      dataReqest.onsuccess = event => resolve(event)
      dataReqest.onerror = event => resolve(event)
    })
      .then(event => {
        // transform from indexedDB representation to cache-friendly variant
        for (let meterIndex = 0; meterIndex < event.target.result.length; meterIndex++) {
          let db_entry = event.target.result[meterIndex]
          newCacheObject[db_entry['meterId']] = db_entry['meterData']
        }
        this.commit('dataStore/overwriteCache', { newCache: newCacheObject })
        console.log('data loaded from persistent cache')
      })
      .catch(err => {
        console.log(err)
      })
  },

  // Returns an array containing intervals of missing data between the start and end
  // Parameters:
  //  meterId: integer that uniquely identifies the meter
  //  start: integer representing linux epoch time of the start of the required interval
  //  end: integer representing linux epoch time of the end of the required interval
  //  uom: the unit of measure/metering point to request data for
  findMissingIntervals (store, payload) {
    if (!this.getters['dataStore/cache'][payload.meterId] || !this.getters['dataStore/cache'][payload.meterId][payload.uom]) {
      // The meter or the uom does not exist in the cache at all
      // This circumvents the rest of the function (as an optimization)
      return [[payload.start, payload.end]]
    }

    // We know that at least the meter and uom exist in the cache from here down

    // Remove all timestamps except for:
    //  - the first timestamp
    //  - timestamps abutting a gap in the data larger than 15 minutes
    //  - the last timestamp
    let timestamps = Object.keys(this.getters['dataStore/cache'][payload.meterId][payload.uom])
      .filter((key) => parseInt(key) >= payload.start && parseInt(key) <= payload.end) // Filter out irrelevant times
      .sort((a, b) => parseInt(a) > parseInt(b)) // Chronologically sort times
      .filter((key, index, array) => {
        // Keep the first, the last, and any indices defining the start and/or end of a gap
        return index === 0 || index === array.length - 1 || Math.abs(key - array[index - 1]) > 900 || Math.abs(key - array[index + 1]) > 900
      })
      .map(ts => parseInt(ts, 10)) // Parse them to integers

    // If no matching records are found, return the original interval
    if (timestamps.length === 0) return [[payload.start, payload.end]]
    else {
      // At least one timestamp was found
      // At this point, we have an array of all intervals where we have data stored
      // We have the start and end times for each interval (inclusive)
      // Now, we need to determine if there are any gaps.
      let returnArr = [] // An array of interval pairs, ie: [[start, end]]
      if (timestamps[0] > payload.start) {
        // The first gap is between the start and the first timestamp
        returnArr.push([payload.start, timestamps[0]])
      }
      // Iterate over the remaining timestamps and search for gaps
      for (let index = 1; index < timestamps.length; index += 2) {
        if (timestamps[index + 1]) {
          returnArr.push([timestamps[index], timestamps[index + 1]])
        } else if (timestamps[index] < payload.end) {
          returnArr.push([timestamps[index], payload.end])
        }
      }
      // Return an array of interval pairs
      return returnArr
    }
  },

  // This is a getData route specifically for the batched requests
  // For single meter-data requests this has more overhead.
  // This function also assumes each request will have same meterClass
  // and point type.
  async getBatchData (store, payload) {
    await this.dispatch('dataStore/loadIndexedDB')

    const requestPoint =  payload[0].uom
    const meterClass = payload[0].classInt

    const requestedDatasets = payload.map(({ meterId, start, end }) => {
      return {
        'id': meterId,
        'startDate': start,
        'endDate': end
      }
    })

    let requestObject = {
      point: requestPoint,
      meterClass: meterClass,
      datasets: []
    }

    for (let dataset of requestedDatasets) {
      let missingIntervals = await this.dispatch('dataStore/findMissingIntervals', {
        meterId: dataset['id'],
        start: dataset['startDate'],
        end: dataset['endDate'],
        uom: requestPoint
      })

      if (missingIntervals.length > 0) {
        requestObject.datasets.push(dataset)
      }
    }

    // Add missing data to cache
    if (requestObject.datasets.length > 0) {
      // Hit API
      const meterData = await API.batchData(requestObject)
        .catch(err => console.log("COULD NOT HIT batchData API ROUTE.", err))

      for (let { id, readings: dataset } of meterData['data']) {
        dataset.forEach(datum => {
          this.commit('dataStore/addToCache', {
            dateTime: datum.time,
            meterId: id,
            uom: requestPoint,
            value: datum.reading
          })
        })
      }

      // Write to persistent cache
      try {
        // add all cached instances to the indexedDB
        await this.dispatch('dataStore/addCacheToIndexedDB')
      } catch (e) {
        console.log(e)
        console.log('Failed to write new datums to the persistent cache.')
      }
    }

    // Get requested data from cache
    let dataArrayObject = {}

    for (let { id, startDate, endDate } of requestedDatasets) {
      let cache
      let cacheKeys
      try {
        cache = this.getters['dataStore/cache'][id][requestPoint]
        cacheKeys = Object.keys(cache).filter(key => key >= startDate && key <= endDate)
      } catch (e) {
        console.log('Data not found for meter: ' + id)
        console.log('Is the meter connected to the internet and uploading data?')
        continue
      }
      dataArrayObject[id] = cacheKeys.map(key => {
        let dataObj = {}
        dataObj[requestPoint] = cache[key]
        dataObj['time'] = parseInt(key)
        return dataObj
      })
    }

    return dataArrayObject
  },

  // Retrieves data from the cache if it exists
  // If the data does not exist, it:
  //   1. Requests for the data from the API
  //   2. Caches the datums
  //   3. Retrieves the data from the cache
  // Parameters:
  //  meterId: integer that uniquely identifies the meter
  //  start: integer representing linux epoch time of the start of the required interval
  //  end: integer representing linux epoch time of the end of the required interval
  //  uom: the unit of measure/metering point to request data for
  //  classInt: An integer that corresponds to the type of meter we are reading from
  async getData (store, payload) {
    // First, attempt to load a cache from indexDB (if the cache is empty)
    await this.dispatch('dataStore/loadIndexedDB')

    // Does the cache contain the data?
    let missingIntervals = await this.dispatch('dataStore/findMissingIntervals', {
      meterId: payload.meterId,
      start: payload.start,
      end: payload.end,
      uom: payload.uom
    })

    if (missingIntervals.length > 0) {
      // The cache does not contain all of the data
      // Add it to the cache
      let promises = []
      missingIntervals.forEach(async (interval) => { // For each interval, request for the data
        if (interval.length === 0) interval.push(Math.round(new Date().getTime() / 1000))
        promises.push(API.data(payload.meterId, interval[0], interval[1], payload.uom, payload.classInt))
      })

      // Save all of the new data to the cache
      const responses = await Promise.all(promises)
        .catch(err => {
          console.log(err)
        })

      // The data looks like an array of these objects:
      // {
      //   accumulated_real: -13385083 // This key can change based on the uom
      //   id: 4596804
      //   time: 1597284900
      // }
      await responses.forEach(async datumArray => {
        datumArray.forEach(datum => {
          this.commit('dataStore/addToCache', {
            datetime: datum.time,
            meterId: payload.meterId,
            uom: payload.uom,
            value: datum[payload.uom]
          })
        })
      })
      try {
        // add all cached instances to the indexedDB
        await this.dispatch('dataStore/addCacheToIndexedDB')
      } catch (e) {
        console.log(e)
        console.log('Failed to write new datums to the persistent cache.')
      }
    }

    // Retrieve the data from the cache
    let cache
    let cacheKeys
    try {
      cache = this.getters['dataStore/cache'][payload.meterId][payload.uom]
      cacheKeys = Object.keys(cache).filter(key => key >= payload.start && key <= payload.end) // Filter out data that is not in our time range
    } catch (e) {
      // Somehow, the data we expect to be in the cache is not there!
      // This occurs when we request for data that does not exist in our database.
      // For example, a building can be brought offline for maintenance, causing
      // a chunk of data to be missing.
      console.log('Data not found for meter: ' + payload.meterId)
      console.log('Is the meter connected to the internet and uploading data?')

      return [] // Return an empty array
    }

    // Reformat the data so that it matches the API's format
    // TODO: JRW 8.13.2020 Someone (probably me) needs to standardize how data is passed around the dashboard.
    //       This reformatting issue should work itself out if we make every component consume a standardized datum class instance.
    let dataArray = []
    cacheKeys.forEach(key => {
      let dataObj = {}
      dataObj[payload.uom] = cache[key]
      dataObj['time'] = parseInt(key)
      dataArray.push(dataObj)
    })
    return dataArray
  }
}

const mutations = {
  // Adds one datetime & value pair to the cache
  // cacheEntry contains:
  //  datetime: an integer representing the linux epoch time corresponding to this datum
  //  meterId: an integer corresponding to a particular meter ID
  //  uom: A string representing the unit of measure
  //  value: a numerical value representing the data
  addToCache: (state, cacheEntry) => {
    if (!state.cache[cacheEntry.meterId]) state.cache[cacheEntry.meterId] = {}
    if (!state.cache[cacheEntry.meterId][cacheEntry.uom]) state.cache[cacheEntry.meterId][cacheEntry.uom] = {}
    state.cache[cacheEntry.meterId][cacheEntry.uom][cacheEntry.datetime] = cacheEntry.value
  },

  // Sets DBInstance property to an initialized indexedDB instance.
  setDBInstance: (state, { instance }) => {
    state.indexedDBInstance = instance
  },

  // Completely overwrites cache with new data.
  // Needed for indexedDB load action to change cache state.
  overwriteCache: (state, { newCache }) => {
    state.cache = newCache
  }

}

const getters = {
  cache (state) {
    return state.cache
  },
  DB (state) {
    return state.indexedDBInstance
  }
}

const modules = {}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules
}
