/* 
 * Filename: app/building.js
 * Description: API endpoints related to buildings
 */
const { default: Building } = await import('/opt/nodejs/models/building.js')
import Response from '/opt/nodejs/response.js'

export async function all(event, context) {
  let response = new Response(event)
  response.body = JSON.stringify((await Building.all()).map(o => o.data))
  response.headers['Content-Type'] = 'application/json'
  return response
}

// This function is used by an external service (automated job)
// to occasionally update the GeoJSON data for multiple buildings
export async function putGeoJSON(event) {
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
