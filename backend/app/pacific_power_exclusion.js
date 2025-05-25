/* Filename: app/pacific_power_exclusion.js
  * Description: API endpoints used to manage Pacific Power exclusions (for webscraper)
*/
import Response from '/opt/nodejs/response.js'
import PacificPowerExclusion from '/opt/nodejs/models/pacific_power_exclusion.js'

export async function get (event, context) {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerExclusion().get())
  return response
}

export async function post (event, context) {
  let response = new Response(event)

  const payload = JSON.parse(event.body)
  const pwd = payload['pwd']
  const meterID = payload['id']

  if (pwd !== process.env.ACQUISUITE_PASS || !meterID) {
    response.statusCode = 400
    return response
  }

  try {
    response.body = JSON.stringify(await new PacificPowerExclusion().add(meterID))
  } catch (error) {
    response.body = error.message
    response.statusCode = 400
  }
  return response
}
