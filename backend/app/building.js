/*
 * @Author: Brogan
 * @Date:   Tuesday May 14th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Tuesday May 14th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Building = require('/opt/nodejs/models/building.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.all = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await Building.all()).map(o => o.data))
  response.headers['Content-Type'] = 'application/json'
  return response
}

exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await new Building(event.queryStringParameters['id']).get()).data)
  return response
}

exports.put = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  await user.resolved
  try {
    let building = await new Building(event.body.id).update(
      event.body.name,
      event.body.mapId,
      event.body.image,
      event.body.group,
      event.body.meters,
      user
    )
    response.body = building.data
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}

// This function is used by an external service (automated job)
// to occasionally update the GeoJSON data for multiple buildings
exports.putGeoJSON = async event => {
  const response = new Response(event)
  try {
    const payload = JSON.parse(event.body)
    const pwd = payload['pwd']
    if (pwd !== process.env.ACQUISUITE_PASS) {
      response.statusCode = 400
      return response
    }

    const buildings = payload.buildings
    // Check if buildings is an array
    if (!Array.isArray(buildings)) {
      throw new Error('Invalid input: body must be an array of { buildingId, buildingGeoJSON } objects')
    }
    // Update each building's GeoJSON
    await Promise.all(
      buildings.map(({ buildingId, buildingGeoJSON }) => {
        return Building.updateGeoJSON(buildingId, buildingGeoJSON)
      })
    )
    response.body = JSON.stringify({ message: 'GeoJSON updated successfully' })
    response.statusCode = 200
  } catch (error) {
    response.body = error.message
    response.statusCode = 400
  }
  return response
}

exports.post = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  await user.resolved
  try {
    response.body = JSON.stringify(
      (
        await Building.create(
          event.body.name,
          event.body.mapId,
          event.body.image,
          event.body.group,
          event.body.meters,
          user
        )
      ).data
    )
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}

exports.delete = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  try {
    await new Building(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
