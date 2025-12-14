/*
 * Filename: data_store.js
 * Description:
 *  Provides a semi-persistent cache for time-series energy data, reducing redundant API requests.
 *  Data is stored as users navigate the dashboard and checked before fetching new data.
 *
 * Example:
 *  - User views electricity data for 7/19/2020 - 7/25/2020 → Stored in cache.
 *  - Later, they request 6/26/2020 - 7/25/2020 → Only missing data (6/26 - 7/19) is fetched.
 *
 * Storage:
 *  The cache is stored in Vuex and indexedDB for persistence across sessions.
 *  IndexedDB is used for batch data but not single meter requests due to performance concerns.
 *  LocalStorage is avoided due to capacity limits.
 */

import API from '../api.js'

const state = () => {
  return {
    cache: {}, // Stores time-series data by meterId and unit of measure (uom)
    requestStore: {}, // Tracks queried data ranges to prevent redundant requests
    indexedDBInstance: undefined, // IndexedDB instance for persistent storage
    // Tracks the status of batch requests to inform the user while loading large datasets
    batchStatus: {
      active: false,
      current: 0,
      total: 0
    }
  }
}

// AWS Lambda has a 6MB response body limit; ensure requests stay within this limit.
const RESPONSE_HEADER_SIZE = 1000 // Overestimated; actual header is ~222 bytes.
const DATA_ITEM_SIZE = 51 // (32 + 2 + 2 + 4 + 11)=51, an over-estimate for each item.
const RESPONSE_MAX_SIZE = 0x250000 // Use smaller value for reduced risk of exceeding the limit.

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

  // Copies chunked "cache" object to indexedDB for persistent storage
  async addChunkToIndexedDB(store) {
    // double-check current store state
    const db = this.getters['dataStore/DB']
    if (db === undefined) throw new Error('indexedDB not instantiated')
    const cache = this.getters['dataStore/cache']
    if (Object.keys(cache).length === 0) throw new Error('cache object is empty')

    // Wrapping each callback into promise so async works on indexedDB api calls
    for (let meterId of Object.keys(cache)) {
      await new Promise((resolve, reject) => {
        const sanitizedData = JSON.parse(JSON.stringify(cache[meterId])) // ensure data is serializable
        let request = db
          .transaction('MeterReadings', 'readwrite')
          .objectStore('MeterReadings')
          .put({ meterId: meterId, meterData: sanitizedData })
        request.onerror = event => reject(event)
        request.onsuccess = event => resolve(event)
      }).catch(err => {
        throw err
      })
    }
  },

  // Loads IndexedDB data into Vuex store for persistent caching.
  // Stores meter readings as { meterId: { uom: { timestamp: value } } }.
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
      let dataRequest = this.getters['dataStore/DB']
        .transaction('MeterReadings', 'readonly')
        .objectStore('MeterReadings')
        .getAll()
      dataRequest.onsuccess = event => resolve(event)
      dataRequest.onerror = event => resolve(event)
    })
      .then(event => {
        // transform from indexedDB representation to cache-friendly variant
        for (let meterIndex = 0; meterIndex < event.target.result.length; meterIndex++) {
          let db_entry = event.target.result[meterIndex]
          newCacheObject[db_entry['meterId']] = db_entry['meterData']
        }
        this.commit('dataStore/overwriteCache', { newCache: newCacheObject })
      })
      .catch(err => {
        console.log(err)
      })
  },

  // Identifies missing time intervals between start and end for a given meter
  // Returns an array of missing intervals [[start, end]]
  findMissingIntervals(store, payload) {
    const { meterId, uom, start, end } = payload
    const cachedIntervals = this.getters['dataStore/requestStore'][meterId]?.[uom] || []

    // No cached intervals for meter/uom -> whole interval is missing
    if (cachedIntervals.length === 0) {
      return [[start, end]]
    }

    // Process cached intervals to find missing segments
    const ranges = cachedIntervals
      .map(([rangeStart, rangeEnd]) => [Math.max(rangeStart, start), Math.min(rangeEnd, end)]) // clip to [start, end]
      .filter(([rangeStart, rangeEnd]) => rangeStart < rangeEnd) // filter out non-overlapping ranges
      .sort((rangeA, rangeB) => {
        // sort by start time
        if (rangeA[0] !== rangeB[0]) return rangeA[0] - rangeB[0]
        // tie-breaker is end time
        return rangeA[1] - rangeB[1]
      })

    const missingIntervals = []
    let cursor = start
    // Add missing intervals between cached ranges
    for (const [rangeStart, rangeEnd] of ranges) {
      // Anything between cursor and the next requested segment is missing
      if (rangeStart > cursor) {
        missingIntervals.push([cursor, rangeStart])
      }
      // Move cursor forward to the end of the requested segment
      cursor = Math.max(cursor, rangeEnd)
    }

    // Trailing tail after the last requested segment
    if (cursor < end) {
      missingIntervals.push([cursor, end])
    }

    return missingIntervals
  },

  /*
    Designed to handle buildings with multiple meters efficiently.
    Assumes each request has the same meterClass and point type.
  */
  async getMultiMeterData(store, payload) {
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
        To avoid exceeding the lambda response body size constraint
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
      const meterDataArray = await Promise.all(
        apiRequests.map(reqObj => API.multiMeterData(reqObj, payload.signal))
      ).catch(err => {
        console.log('Error accessing multiMeterData api route:', err)
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

  // Requests data in chunks to avoid exceeding the AWS lambda response body size limit
  async getChunkData(store, payload) {
    const { meterId, start, end, uom, classInt, signal } = payload
    await this.dispatch('dataStore/loadIndexedDB')

    const requests = []

    // Break up the request into batches
    const totalRequestSize = this.getters['dataStore/requestSize']([{ id: meterId, startDate: start, endDate: end }])
    const numberOfBatches = Math.ceil(totalRequestSize / RESPONSE_MAX_SIZE)
    const batchSize = Math.ceil((end - start) / numberOfBatches)
    for (let i = 0; i < numberOfBatches; i++) {
      const startDate = start + i * batchSize
      const endDate = Math.min(start + (i + 1) * batchSize, end)
      requests.push([meterId, startDate, endDate, uom, classInt])
    }

    // Set the initial batch status before making requests
    this.commit('dataStore/setBatchStatus', { active: true, total: numberOfBatches, current: 1 })

    // Request data in batches
    const meterDataArray = []
    for (const request of requests) {
      try {
        const meterData = await API.data(...request, signal)
        if (meterData && Array.isArray(meterData) && meterData.length > 0) {
          meterDataArray.push(meterData)
        }
      } catch (err) {
        // Log request details if the request was not aborted
        if (!signal?.aborted) {
          console.error(`Error with chunked request. Request Details: 
            meterId: ${request[0]},
            start: ${request[1]},
            end: ${request[2]},
            uom: ${request[3]},
            classInt: ${request[4]}`)
        }
        // Clear the batch status and rethrow the error to stop processing
        this.commit('dataStore/clearBatchStatus')
        throw err
      }

      // After each request, update the batch status
      this.commit('dataStore/incrementBatch')
    }

    // Reset the batch status after all requests are complete
    this.commit('dataStore/clearBatchStatus')

    if (meterDataArray.length > 0) {
      for (const dataset of meterDataArray) {
        if (dataset.length > 0) {
          // Write to request store
          this.commit('dataStore/addToRequestStore', {
            meterId: meterId,
            start: dataset[dataset.length - 1].time,
            end: dataset[0].time,
            uom: uom
          })

          // Write to cache
          dataset.forEach(datum => {
            this.commit('dataStore/addToCache', {
              datetime: datum.time,
              meterId: meterId,
              uom: uom,
              value: datum[uom]
            })
          })

          // Write to persistent cache
          try {
            // Add all cached instances to the indexedDB
            await this.dispatch('dataStore/addChunkToIndexedDB')
          } catch (e) {
            console.log(e)
            console.log('Failed to write new datums to the persistent cache.')
          }
        }
      }
    } else {
      console.log('Catastrophic error occured with API')
    }

    // Retrieve the data from the cache
    try {
      const cache = this.getters['dataStore/cache'][meterId]?.[uom] || {}
      const cacheKeys = Object.keys(cache)
        .map(Number)
        .filter(key => key >= start && key <= end)

      // Convert data to the API's format
      return cacheKeys.map(time => ({ time, [uom]: cache[time] }))
    } catch (error) {
      // Data not found in cache. This can happen if the data does not exist in the database.
      // For example, a building might be offline for maintenance, causing missing data.
      console.warn(`Data not found for meter: ${meterId}. Is the meter connected to the internet and uploading data?`)
      return []
    }
  },

  /* Retrieves data from the cache if it exists
   * If not, requests data from the API, caches it, and retrieves it from the cache
   * Parameters:
   * meterId: integer that uniquely identifies the meter
   * start: integer representing linux epoch time of the start of the required interval
   * end: integer representing linux epoch time of the end of the required interval
   * uom: the unit of measure/metering point to request data for
   * classInt: An integer that corresponds to the type of meter we are reading from
   */
  async getData(store, payload) {
    const { meterId, start, end, uom, classInt, signal } = payload
    // Find missing data intervals
    let missingIntervals = await this.dispatch('dataStore/findMissingIntervals', {
      meterId: meterId,
      start: start,
      end: end,
      uom: uom
    })

    if (missingIntervals.length > 0) {
      const estimatedSize = await this.getters['dataStore/dataSetSize']({
        id: meterId,
        startDate: start,
        endDate: end
      })
      if (estimatedSize >= RESPONSE_MAX_SIZE) {
        // If the request size is too large, batch the request.
        const result = await this.dispatch('dataStore/getChunkData', payload)
        return Object.values(result).flat() // Flatten data into a single array
      }

      // Define an array of promises to fetch missing data
      const promises = missingIntervals.map(interval => {
        // If the interval is empty, request the most recent data
        if (interval.length === 0) {
          interval.push(Math.round(new Date().getTime() / 1000))
        }
        return API.data(meterId, interval[0], interval[1], uom, classInt, signal)
      })

      // Prevent redundant requests during this session
      this.commit('dataStore/addToRequestStore', {
        meterId: meterId,
        start: start,
        end: end,
        uom: uom
      })

      // Fetch missing data from API and add it to the cache
      const responses = await Promise.all(promises)
      responses.forEach(datumArray => {
        datumArray.forEach(datum => {
          this.commit('dataStore/addToCache', {
            datetime: datum.time,
            meterId: meterId,
            uom: uom,
            value: datum[uom]
          })
        })
      })
    }

    // Retrieve the data from the cache
    try {
      const cache = this.getters['dataStore/cache'][meterId]?.[uom] || {}
      const cacheKeys = Object.keys(cache)
        .map(Number)
        .filter(key => key >= start && key <= end)

      // Convert data to the API's format
      return cacheKeys.map(time => ({ time, [uom]: cache[time] }))
    } catch (error) {
      // Data not found in cache. This can happen if the data does not exist in the database.
      // For example, a building might be offline for maintenance, causing missing data.
      console.warn(`Data not found for meter: ${meterId}. Is the meter connected to the internet and uploading data?`)
      return []
    }
  }
}

// Merges a new interval into a list of existing intervals while maintaining sorted order
function mergeIntervals(intervals, newInterval) {
  const res = []
  const n = intervals.length
  let i = 0

  // Add all intervals that end before newInterval starts
  while (i < n && intervals[i][1] < newInterval[0]) {
    res.push(intervals[i])
    i++
  }

  // Merge all overlapping intervals into newInterval
  while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0])
    newInterval[1] = Math.max(newInterval[1], intervals[i][1])
    i++
  }
  res.push(newInterval)

  // Add rest of intervals that start after newInterval ends
  while (i < n) {
    res.push(intervals[i])
    i++
  }

  return res
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

  setBatchStatus(state, { active, current, total }) {
    state.batchStatus.active = active
    state.batchStatus.current = current
    state.batchStatus.total = total
  },

  incrementBatch(state) {
    state.batchStatus.current++
  },

  clearBatchStatus(state) {
    state.batchStatus.active = false
    state.batchStatus.current = 0
    state.batchStatus.total = 0
  },

  /*
      This function adds an element to the request store & merges overlapping ranges.

      Basically we use a nested structure to keep track of which meter data ranges we've already
      queried during a user's session.  This makes it so we minimize redundant requests for data
      that won't exist in the database.  We don't persist this data since it's concievable that
      our database will acquire the data at some point, but it's unlikely it will occur during a
      single user session.

      The nested structure works by storing a sorted array of tuples containing a start and end date for data
      of form (start time, end time)

      Like for meterID = 15 and the unit of measurement of `accumulated_real`: [(143500, 134560), (134590, 145000)]

      When we add another range to the data, we push that tuple into our nested structure and perform a reduction
      to merge overlapping ranges:

      E.g. [(143500, 143600), (143560, 143555)] -> [(143500, 143600)]
  */
  addToRequestStore: (state, { meterId, uom, start, end }) => {
    // Initialize request store for (meterId, uom) if it doesn't exist
    if (!state.requestStore[meterId]) {
      state.requestStore[meterId] = {}
    }
    if (!state.requestStore[meterId][uom]) {
      state.requestStore[meterId][uom] = [[start, end]]
      return
    }

    // Merge new range into existing ranges
    const existingIntervals = state.requestStore[meterId][uom]
    const newInterval = [start, end]
    state.requestStore[meterId][uom] = mergeIntervals(existingIntervals, newInterval)
  },

  // Sets DBInstance property to an initialized indexedDB instance.
  setDBInstance: (state, { instance }) => {
    state.indexedDBInstance = instance
  },

  // Overwrites cache with new data from indexedDB.
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

  batchStatus(state) {
    return state.batchStatus
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
