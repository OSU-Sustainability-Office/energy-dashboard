const Response = require('/opt/nodejs/response.js')
const PacificPowerExclusion = require('/opt/nodejs/models/pacific_power_exclusion.js')

exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify(await new PacificPowerExclusion().get())
  return response
}

exports.post = async (event, context) => {
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
    response.status = 400
  }
  return response
}
