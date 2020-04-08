/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-03-11T13:46:26-07:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-03-12T10:25:25-07:00
 */
const axios = require('axios')
require('dotenv').config({ path: '/opt/nodejs/.env.api' })

module.exports = () => {
  return new Promise((resolve, reject) => {
    axios.post('https://api.oregonstate.edu/oauth2/token', `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`).then(r => {
      resolve(r.data.access_token)
    }).catch(e => {
      reject(e)
    })
  })
}
