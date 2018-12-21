/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-21T12:03:57-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-21T13:09:51-08:00
 */
import fs from 'fs'
const path = require('path')

function callAPI (route, data = null, method = 'get', base = '/energy/') {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '__mockdata__', route + '_' + method + '.json'), 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      }
      let r = { data: JSON.parse(data) }
      resolve(r)
    })
  })
}

export default {
  story: async (id, data = null, method = 'get') => {
    if (method === 'get') {
      return (await callAPI('story?id=' + id)).data
    } else {
      return (await callAPI('story', data, method)).data
    }
  },
  stories: async () => {
    return (await callAPI('stories')).data
  },
  buildings: async () => {
    return (await callAPI('buildings')).data
  },
  meters: async id => {
    return (await callAPI('meters?id=' + id)).data
  },
  data: async (id, start, end, point) => {
    return (await callAPI('data?id=' + id + '&startDate=' + start + '&endDate=' + end + '&point=' + point)).data
  },
  user: async () => {
    return (await callAPI('user')).data
  },
  group: async (data, method) => {
    return (await callAPI('group', data, method)).data
  },
  block: async (data, method) => {
    return (await callAPI('block', data, method)).data
  },
  chart: async (data, method) => {
    return (await callAPI('chart', data, method)).data
  },
  mapData: async () => {
    return (await callAPI('map')).data
  },
  media: async () => {
    return (await callAPI('media')).data
  },
  buildingMeters: async id => {
    return (await callAPI('meters?id=' + id)).data
  },
  metersByBuilding: async () => {
    return (await callAPI('metersByBuilding')).data
  },
  meterPoints: async id => {
    return (await callAPI('meterPoints?id=' + id)).data
  },
  alerts: async () => {
    return (await callAPI('alerts')).data
  },
  alert: async (data, method) => {
    return (await callAPI('alert', data, method)).data
  },
  logout: async () => {
    return (await callAPI('logout')).data
  }
}
