import Response from '/opt/nodejs/response.js'
import SolarRecent from '/opt/nodejs/models/solar_recent.js'

export async function get(event, context) {
  let response = new Response(event)
  response.body = JSON.stringify(await new SolarRecent().get())
  return response
}
