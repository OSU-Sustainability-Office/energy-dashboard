/**
 * @Author: Brogan Miner <Brogan.Miner@oregonstate.edu>
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
  devices: async () => {
    return (await callAPI('admin/devices')).data
  },

  boundedFeatures: async (payload) => {
    return (await callAPI(`map?bbox=${payload.left},${payload.bottom},${payload.right},${payload.top}`, null, 'get', 'https://api.openstreetmap.org/api/0.6')).data
    // return (await callAPI(`way/40535383/full`, null, 'get', 'https://api.openstreetmap.org/api/0.6')).data
  },
  buildingFeature: async (payload) => {
    return (await callAPI(`way/${payload}/full`, null, 'get', 'https://api.openstreetmap.org/api/0.6')).data
  },
  users: async () => {
    return (await callAPI('admin/users')).data
  },
  view: async (id, payload = null, method = 'get') => {
    if (method === 'get') {
      return (await callAPI('view?id=' + id)).data
    } else {
      return (await callAPI('view', payload, method)).data
    }
  },
  images: async () => {
    return (await callAPI('images')).data
  },
  login: async () => {
    return (await callAPI('login?returnURI=' + encodeURI('http://localhost:8080'), null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth')).data
  },
  logout: async () => {
    return (await callAPI('logout', null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth')).data
  },
  buildings: async () => {
    return (await callAPI('allbuildings')).data
  },
  building: async (method, data) => {
    return (await callAPI('building', data, method)).status
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
    return (await callAPI('user', null, 'get', 'https://api.sustainability.oregonstate.edu/v2/auth')).data
  },
  edashUser: async (onid) => {
    return (await callAPI('user?onid=' + onid)).data
  }
}
