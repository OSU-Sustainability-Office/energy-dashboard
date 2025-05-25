import Response from '/opt/nodejs/response.js'
import PacificPowerRecent from '/opt/nodejs/models/pacific_power_recent.js'

// Get most recent Unix Timestamp and Pacific Power Meter ID for each Pacific Power Meter, within last 7 days
export async function get (event, context) {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerRecent().get())
  return response
}
