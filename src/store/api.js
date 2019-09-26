/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T16:22:04-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-03-25T15:36:20-07:00
 */
import axios from 'axios'

function callAPI (route, data = null, method = 'get', base = process.env.VUE_APP_ROOT_API) {
  return axios(base + '/' + route, { method: method, data: data, withCredentials: true, timeout: 72000 })
}

export default {
  story: async (id, data = null, method = 'get') => {
    if (method === 'get') {
      return (await callAPI('story?id=' + id)).data
    } else {
      return (await callAPI('story', data, method)).data
    }
  },
  login: async () => {
    return (await callAPI('login', null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth/')).data
  },
  logout: async () => {
    return (await callAPI('logout', null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth/')).data
  },
  stories: async () => {
    return (await callAPI('stories')).data
  },
  buildings: async () => {
    return (await callAPI('allbuildings')).data
  },
  meterGroup: async id => {
    return (await callAPI('metergroup?id=' + id)).data
  },
  meter: async id => {
    return (await callAPI('meter?id=' + id)).data
  },
  data: async (id, start, end, point, classInt) => {
    return (await callAPI('data?id=' + id + '&startDate=' + start + '&endDate=' + end + '&point=' + point + '&meterClass=' + classInt)).data
  },
  user: async () => {
    return (await callAPI('user', null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth/')).data
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
    return (await callAPI('buildings', null, 'get', '/map/')).data
  },
  media: async () => {
    return (await callAPI('media')).data
  },
  buildingMeters: async id => {
    return (await callAPI('meters?id=' + id)).data
  },
  buildingForStory: async id => {
    return (await callAPI('buildingForStory?story=' + id)).data
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
  campaign: async id => {
    return (await callAPI('campaign?id=' + id)).data
  },
  campaigns: async () => {
    return (await callAPI('campaigns')).data
  },
  allusers: async () => {
    return (await callAPI('allusers')).data
  },
  updateuser: async (privilege, id) => {
    return (callAPI('user', { privilege: privilege, id: id }, 'put'))
  },
  allMeters: async () => {
    return (await callAPI('allMeters')).data
  }
}
