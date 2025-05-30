const Response = require('/opt/nodejs/response.js')
const PacificPowerRecent = require('/opt/nodejs/models/pacific_power_recent.js')

// Get most recent Unix Timestamp and Pacific Power Meter ID for each Pacific Power Meter, within last 7 days
exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerRecent().get())
  return response
}
