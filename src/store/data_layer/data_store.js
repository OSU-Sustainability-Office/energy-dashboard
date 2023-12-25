/*
 * Filename: data_store.js
 * Info:
 *  This file provides a (semi-)persistent cache for time series energy data. The
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
 *
 * UPDATE: 5/25/22
 * So, there's a slight problem with our persistent cache: there's no efficient browser API
 * for storing large quantitites of meter-data.  Using localStorage is insufficient as its
 * capacity is easily overloaded, and indexedDB, while capable of storing large quantities
 * of data, is incredibly slow (https://rxdb.info/slow-indexeddb.html).  There are ways to
 * optimize its performance via batch-ing requests, but at the current moment it seems logical
 * to offload performance costs to the API side of things to maintain the usability of the dashboard.
 *
 * The persistent storage API is still enbabled for batchData requests (e.g. for the LINc building)
 * but for non-batched meter requests (the majority of the dashboard requests) we're just going to
 * not persistently store the meter data on the user-end.
 */

import API from '../api.js'

const state = () => {
  return {
    cache: {
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
    // Prevent extraneous requests when possible
    // Maps [uom][meter_id] -> range set of queried data
    requestStore: {},
    indexedDBInstance: undefined
  }
}

/*
 To prevent exceeding the AWS lambda response body size limit we'll take into account the maximum response size we can send.
*/
const RESPONSE_HEADER_SIZE = 1000 // this is an over-calculation, the actual header is normally 222 bytes.
const DATA_ITEM_SIZE = 51 // (32 + 2 + 2 + 4 + 11)=51, an over-estimate for each item.
const RESPONSE_MAX_SIZE = 0x600000 // 6MB limit = 6*(2^20) Bytes

const actions = {
  // Copies "cache" object to indexedDB for persistent storage
  async addCacheToIndexedDB(store) {
    // double-check current store state
    const db = this.getters['dataStore/DB']
    if (db === undefined) throw new Error('indexedDB not instantiated')
    const cache = this.getters['dataStore/cache']
    if (cache.length === 0) throw new Error('cache object is empty')

    // Wrapping each callback into promise so async works on indexedDB api calls
    for (let meterId of Object.keys(cache)) {
      await new Promise((resolve, reject) => {
        let request = db
          .transaction('MeterReadings', 'readwrite')
          .objectStore('MeterReadings')
          .put({ meterId: meterId, meterData: { ...cache[meterId] } })
        request.onerror = event => reject(event)
        request.onsuccess = event => resolve(event)
      }).catch(err => {
        throw err
      })
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

  async loadIndexedDB(store) {
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
            event.target.result.createObjectStore('MeterReadings', {
              keyPath: 'meterId'
            })
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
        this.commit('dataStore/setDBInstance', {
          instance: event.target.result
        })
      })
      .catch(event => {
        console.log('An error occured when trying to use indexedDB API, is it enabled?')
      })

    // Then, load indexedDB into the dataStore's cache object
    let newCacheObject = {}
    await new Promise((resolve, reject) => {
      let dataReqest = this.getters['dataStore/DB']
        .transaction('MeterReadings', 'readonly')
        .objectStore('MeterReadings')
        .getAll()
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
  findMissingIntervals(store, payload) {
    if (
      !this.getters['dataStore/cache'][payload.meterId] ||
      !this.getters['dataStore/cache'][payload.meterId][payload.uom]
    ) {
      // The meter or the uom does not exist in the cache at all
      // This circumvents the rest of the function (as an optimization)
      return [[payload.start, payload.end]]
    }

    // Check if this interval is encapsulated in our request store. vue.$store.getters['dataStore/inRangeSet']({id:3, start:3, end:34})
    if (
      this.getters['dataStore/inRangeSet']({
        uom: payload.uom,
        id: payload.meterId,
        start: payload.start,
        end: payload.end
      })
    ) {
      return []
    }
    // We know that at least the meter and uom exist in the cache from here down

    // Remove all timestamps except for:
    //  - the first timestamp
    //  - timestamps abutting a gap in the data larger than 15 minutes
    //  - the last timestamp
    let timestamps = Object.keys(this.getters['dataStore/cache'][payload.meterId][payload.uom])
      .filter(key => parseInt(key) >= payload.start && parseInt(key) <= payload.end) // Filter out irrelevant times
      .sort((a, b) => parseInt(a) - parseInt(b)) // Chronologically sort times
      .filter((key, index, array) => {
        // Keep the first, the last, and any indices defining the start and/or end of a gap
        return (
          index === 0 ||
          index === array.length - 1 ||
          Math.abs(key - array[index - 1]) > 900 ||
          Math.abs(key - array[index + 1]) > 900
        )
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

  /*
    getBatchData function specifically for requesting large sets of data.
    The dashboard was originally designed to send out requests per-meter,
    which unfortunately becomes really slow when handling buildings with
    >5 meters in a meterGroup, especially since we need all the meter data
    to show accurate readings.

    This function assumes each request will have the same metreClass and point type.
  */
  async getBatchData(store, payload) {
    await this.dispatch('dataStore/loadIndexedDB')
    const requestPoint = payload[0].uom
    const meterClass = payload[0].classInt

    const requestedDatasets = payload.map(({ meterId, start, end }) => {
      return {
        id: meterId,
        startDate: start,
        endDate: end
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
      // estimate our request size (will be an overestimate).
      let requestSize = this.getters['dataStore/requestSize'](requestObject.datasets)

      // Array of promises
      const apiRequests = []

      /*
        To avoid exceeding the lambda response body size constraint (~6MB)
        we're going to delegate the datasets evenly across multiple
        requests.  This assumes that our datasets are roughly equivalent in
        size.
      */
      if (requestSize >= RESPONSE_MAX_SIZE) {
        // Divide the requests up by time.
        const batchSize = Math.ceil(requestSize / RESPONSE_MAX_SIZE)

        // Initialize divided request objects
        for (let _ = 0; _ < batchSize; _++) {
          apiRequests.push({ ...requestObject, datasets: [] })
        }

        // Distribute the datasets evenly.
        for (let i = 0; i < requestObject.datasets.length; i++) {
          let index = i % batchSize
          apiRequests[index].datasets.push(requestObject.datasets[i])
        }
      } else {
        // otherwise we can just send a single request
        apiRequests.push(requestObject)
      }

      // hit API
      const meterDataArray = await Promise.all(apiRequests.map(reqObj => API.batchData(reqObj))).catch(err => {
        console.log('Error accessing batchData api route:', err)
      })

      if (meterDataArray !== undefined) {
        for (const meterData of meterDataArray) {
          // Write to cache
          for (let { id, readings: dataset } of meterData['data']) {
            // write to RequestStore

            // Ignore if dataset is zero.  This will occur if we have a defunct
            // meter still included in a meter group (e.g. valley library).
            // We still add it to the volatile request store, since it's unlikely
            // to re-appear during a user session.
            if (dataset.length === 0) {
              for (let i = 0; i < requestedDatasets.length; i++) {
                if (requestedDatasets[i].meterId === id) {
                  this.commit('dataStore/addToRequestStore', {
                    meterId: id,
                    start: requestedDatasets[i].startDate,
                    end: requestedDatasets[i].endDate,
                    uom: requestPoint
                  })
                }
              }
              // don't commit this to the persistent store, since we don't have any data.
              // and, idealiistically, we might actually recover said data later on.
              continue
            }
            this.commit('dataStore/addToRequestStore', {
              meterId: id,
              start: dataset[dataset.length - 1].time,
              end: dataset[0].time,
              uom: requestPoint
            })

            // write to cache
            dataset.forEach(datum => {
              this.commit('dataStore/addToCache', {
                datetime: datum.time,
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
      } else {
        // Something went very wrong if our response is undefined
        console.log('Catastrophic error occured with API')
        // alert('Catastrophic error occured with API')
      }
    }

    // Get requested data from cache
    let dataArrayObject = {}

    for (let { id, startDate, endDate } of requestedDatasets) {
      // console.log('>>>', startDate, endDate)
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
  async getData(store, payload) {
    // First, check the non-persistent cahce object:
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
      missingIntervals.forEach(async interval => {
        // For each interval, request for the data
        if (interval.length === 0) {
          interval.push(Math.round(new Date().getTime() / 1000))
        }
        promises.push(API.data(payload.meterId, interval[0], interval[1], payload.uom, payload.classInt))
      })

      // add to request store so we don't re-request this data in this session
      this.commit('dataStore/addToRequestStore', {
        meterId: payload.meterId,
        start: payload.start,
        end: payload.end,
        uom: payload.uom
      })

      // Save all of the new data to the cache
      const responses = await Promise.all(promises).catch(err => {
        console.log(err)
      })

      // The data looks like an array of these objects:
      // {
      //   accumulated_real: -13385083 // This key can change based on the uom
      //   id: 4596804
      //   time: 1597284900
      // }
      await responses.forEach(async datumArray => {
        // push data to our cache for future retrieval
        datumArray.forEach(datum => {
          this.commit('dataStore/addToCache', {
            datetime: datum.time,
            meterId: payload.meterId,
            uom: payload.uom,
            value: datum[payload.uom]
          })
        })
      })
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
    // TODO: MAD 5.25.2022 ^ That is a good idea, I should do that.
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
    if (!state.cache[cacheEntry.meterId][cacheEntry.uom]) {
      state.cache[cacheEntry.meterId][cacheEntry.uom] = {}
    }
    state.cache[cacheEntry.meterId][cacheEntry.uom][cacheEntry.datetime] = cacheEntry.value
  },

  /*
      This function adds an element to the request store & merges overlapping ranges.

      Basically we use a "range-set" to keep track of which meter data ranges we've already
      queried during a user's session.  This makes it so we minimize redundant requests for data
      that won't exist in the database.  We don't persist this data since it's concievable that
      our database will acquire the data at some point, but it's unlikely it will occur during a
      single user session.

      The range set works by storing a sorted array of tuples containing a start and end date for data
      of form (start time, end time)

      Like for meterID = 15 and the unit of measurement of `accumulated_real`: [(143500, 134560), (134590, 145000)]

      When we add another range to the data, we push that tuple into our range-set and perform a reduction
      to merge overlapping ranges:

      E.g. [(143500, 143600), (143560, 143555)] -> [(143500, 143600)]
  */
  addToRequestStore: (state, { meterId, uom, start, end }) => {
    if (state.requestStore[uom] === undefined) state.requestStore[uom] = []

    if (!Object.keys(state.requestStore[uom]).includes(meterId)) {
      state.requestStore[uom][meterId] = [[start, end]]
    } else {
      state.requestStore[uom][meterId].unshift([start, end])
      // Reduce range sets if possible
      state.requestStore[uom][meterId].sort((a, b) => a[0] - b[0])
      let reductionComplete = false
      while (!reductionComplete) {
        reductionComplete = true
        const reducedRangeSet = []
        for (let i = 0; i < state.requestStore[uom][meterId].length - 1; i++) {
          const thisRange = state.requestStore[uom][meterId][i]
          const nextRange = state.requestStore[uom][meterId][i + 1]
          if (thisRange[1] > nextRange[1]) {
            reducedRangeSet.push([thisRange[0], thisRange[1]])
            i++ // increase i to skip merged range
            reductionComplete = false
          } else {
            reducedRangeSet.push(thisRange)
          }
        }
        // write new, possibly reduced request store
        state.requestStore[uom][meterId] = reducedRangeSet
      }
    }
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
  cache(state) {
    return state.cache
  },
  DB(state) {
    return state.indexedDBInstance
  },
  requestStore(state) {
    return state.requestStore
  },

  // checks if we have already queried this date range for the given unit of measurement (uom)
  inRangeSet:
    (state, getters) =>
    ({ uom, id, start, end }) => {
      if (getters.requestStore[uom] === undefined) return false
      if (getters.requestStore[uom][id] === undefined) return false
      for (let i = 0; i < getters.requestStore[uom][id].length; i++) {
        if (getters.requestStore[uom][id][i][0] <= start && getters.requestStore[uom][id][i][1] >= end) {
          return true
        }
      }
      return false
    },

  // calculates data set size, assuming there's a data-point every 15 minutes.
  // (this assumption may not hold for some meter-types), it is unlikely any
  // meter will have more frequent data reporting.
  dataSetSize:
    (state, getters) =>
    ({ id, startDate, endDate }) => {
      // date is in seconds so 900 seconds = 15 minute interval
      const numItems = Math.ceil((endDate - startDate) / 900)
      return DATA_ITEM_SIZE * numItems
    },

  requestSize: (state, getters) => requests => {
    let totalSize = RESPONSE_HEADER_SIZE
    for (let dataset of requests) {
      totalSize += getters.dataSetSize(dataset)
    }
    return totalSize
  },

  // determines if size exceeds the lambda API response limit
  requestSizeException: (state, getters) => requests => {
    return getters.requestSize(requests) >= RESPONSE_MAX_SIZE
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
