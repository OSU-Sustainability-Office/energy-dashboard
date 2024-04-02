const Response = require('/opt/nodejs/response.js')
const PacificPowerData = require('/opt/nodejs/models/pacific_power_data.js')

// Get most recent Unix Timestamp and Pacific Power Meter ID for each Pacific Power Meter, within last 7 days
exports.recent = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerData().recent())
  return response
}
