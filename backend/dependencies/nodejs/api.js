/* 
 * Filename: dependencies/nodejs/api.js
 * Description: Fetches an OAuth2 access token from the Oregon State University API.
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
