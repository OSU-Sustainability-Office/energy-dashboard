/*
  Filename: api.js
  Info: API module for handling all API calls to the backend and external APIs.
*/
import axios from 'axios'
axios.defaults.withCredentials = true

function callAPI(
  route,
  data = null,
  method = 'get',
  base = import.meta.env.VITE_ROOT_API,
  headers = null,
  timeoutMS = 72000,
  allowCredentials = true
) {
  /* This if-clause for "allowCredentials" deserves an explanation:
     Locally, when using "sam local start-api" the response class in the lambda common layer
     will reply with a HTTP headers allow-origin set to "*" and the credentials flag to true.
     On most browsers released after 1875 this will immediately trigger a CORS violation and
     stop us from requesting any data locally--which makes testing the front-end locally a lot
     harder. To side-step this, we will ignore the credentials flag if we're querying a local
     API.

     NOTE: In production we do want to set withCredentials to true so we can use HTTPS & cookies
     for the user login session.
  */
  if (import.meta.env.VITE_ROOT_API === 'http://localhost:3000') {
    allowCredentials = false
    // increase timeout since it's slow locally testing.
    timeoutMS = timeoutMS * 4
  }
  if (headers) {
    return axios(base + '/' + route, {
      method: method,
      data: data,
      withCredentials: allowCredentials,
      timeout: timeoutMS,
      headers: headers
    })
  }
  return axios(base + '/' + route, {
    method: method,
    data: data,
    withCredentials: allowCredentials,
    timeout: timeoutMS
  })
}

export default {
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
    return (
      await callAPI(
        'data?id=' + id + '&startDate=' + start + '&endDate=' + end + '&point=' + point + '&meterClass=' + classInt
      )
    ).data
  },
  multiMeterData: async requestArray => {
    // Why a POST request? Most browsers disallow GET requests to have payloads (i.e., a body field).
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
    // We're also increasing the timeeout to 2 minutes to account for really slow requests (e.g. LINC 1 year data)
    return (
      await callAPI('multiMeterData', JSON.stringify(requestArray), 'post', import.meta.env.VITE_ROOT_API, null, 120000)
    ).data
  },
  getGeoJSON: async payload => {
    return (
      await callAPI(
        `interpreter?data=[out:xml];way(id:${payload});(._;>;);out;`,
        null,
        'get',
        'https://maps.mail.ru/osm/tools/overpass/api',
        {
          Accept: 'text/xml'
        },
        72000,
        false
      )
    ).data
  },
  campaigns: async () => {
    return (await callAPI('campaigns')).data
  },
  systemtime: async () => {
    return (await callAPI('systemtime')).data
  }
}
