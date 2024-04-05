const Response = require('/opt/nodejs/response.js')
const PacificPowerExclusion = require('/opt/nodejs/models/pacific_power_exclusion.js')

exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerExclusion().get())
  return response
}
