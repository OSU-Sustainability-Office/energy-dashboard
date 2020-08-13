/*
 * This file provides a non-persistent cache for time series energy data. The
 * goal is to accumulate data in this datastore as the user navigates around the
 * energy dashboard. As an optimization, data will be read from this datastore
 * before any additional data is requested from the API.
 *
 * For example, let's say a user starts a new session and visits the map. Since this user just
 * started their session, no data will be in the datastore. If the user clicks on the MU, viewing
 * a week's worth of data from 7/19/2020 thru 7/25/2020, then the MU electricity data will be
 * written to the datastore.
 *
 * Now, let's say that same user (in the same session) visits a few more dashbaords
 * before eventually returning to the MU's dashboard. The user modifies the date
 * range to view a month of data (from 6/26/2020 to 7/25/2020). Since we already
 * have data from 7/19-7/25 stored in the local datastore, only the data from
 * 6/26-7/19 will be requested from the API.
 */

/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */
import API from '../api.js'
// import Meter from '../meter.module.js'

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
    }
  }
}

const actions = {

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
      .sort((a, b) => parseInt(a) <= parseInt(b))
      .filter((key, index, array) => {
        // Keep the first, the last, and any indices defining the start and/or end of a gap
        return index === 0 || index === array.length - 1 || Math.abs(key - array[index - 1]) > 900 || Math.abs(key - array[index + 1]) > 900
      })

    // Return pairs of two consecutive timestamps
    // [2, 3, 4, 5, 6, 4, 3, 5, 5] becomes
    // [
    //  [2, 3],
    //  [4, 5],
    //  [6, 4],
    //  [3, 5],
    //  [5]
    // ]
    return timestamps.reduce((result, value, index, array) => {
      result.push(array.slice(index, index + 2))
      return result
    }, [])
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
    // Does the cache contain the data?
    const missingIntervals = await this.dispatch('dataStore/findMissingIntervals', {
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
      await Promise.all(promises).then(responses => {
        // The data looks like an array of these objects:
        // {
        //   accumulated_real: -13385083 // This key can change based on the uom
        //   id: 4596804
        //   time: 1597284900
        // }
        responses.forEach(datumArray => {
          datumArray.forEach(datum => {
            this.commit('dataStore/addToCache', {
              datetime: datum.time,
              meterId: payload.meterId,
              uom: payload.uom,
              value: datum[payload.uom]
            })
          })
        })
      })
    }

    // Retrieve the data from the cache
    const cache = this.getters['dataStore/cache'][payload.meterId][payload.uom]
    const cacheKeys = Object.keys(cache).filter(key => key >= payload.start && key <= payload.end)
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
  }
}

const getters = {
  cache (state) {
    return state.cache
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
