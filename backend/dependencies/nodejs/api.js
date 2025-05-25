/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-03-11T13:46:26-07:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-03-12T10:25:25-07:00
 */
import { post } from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: '/opt/nodejs/.env.api' })


export default () => {
  return new Promise((resolve, reject) => {
    post(
      'https://api.oregonstate.edu/oauth2/token',
      `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`
    )
      .then(r => {
        resolve(r.data.access_token)
      })
      .catch(e => {
        reject(e)
      })
  })
}
