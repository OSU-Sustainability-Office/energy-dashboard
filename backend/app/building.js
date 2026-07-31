/*
 * Filename: app/building.js
 * Description: API endpoints related to buildings
 */
const { default: Building } = await import('/opt/nodejs/models/building.js')
import Response from '/opt/nodejs/response.js'
import { createHash } from 'crypto'

// The frontend refetches this ~260 KB payload on every page load, but the data only
// changes when a building or meter is added/edited.
//
// max-age=0 deliberately means "never serve this without checking" -- there is no
// staleness window, so a change is visible on the next navigation rather than after
// some timeout. stale-while-revalidate is what buys the speed: the browser paints
// from cache immediately and refreshes in the background, instead of blocking on the
// request. Browsers without stale-while-revalidate support (Firefox) fall back to a
// blocking revalidation, which the ETag below turns into a ~300 byte 304.
//
// Do not swap this for a non-zero max-age without a way to invalidate: buildings are
// currently edited by direct SQL against prod, so nothing in the app can bust the
// cache after a write.
const CACHE_CONTROL = 'max-age=0, stale-while-revalidate=86400'

// Header casing is not guaranteed across API Gateway payload format versions.
function getHeader(event, name) {
  const headers = event.headers || {}
  const key = Object.keys(headers).find(k => k.toLowerCase() === name)
  return key === undefined ? undefined : headers[key]
}

// If-None-Match is a comma-separated list and entries may be weak validators (W/"…").
function matchesETag(ifNoneMatch, etag) {
  if (!ifNoneMatch) return false
  if (ifNoneMatch.trim() === '*') return true
  return ifNoneMatch
    .split(',')
    .map(candidate => candidate.trim().replace(/^W\//, ''))
    .includes(etag)
}

export async function all(event, context) {
  let response = new Response(event)
  const body = JSON.stringify((await Building.all()).map(o => o.data))
  const etag = `"${createHash('sha1').update(body).digest('base64')}"`

  response.headers['Cache-Control'] = CACHE_CONTROL
  response.headers['ETag'] = etag
  // Response reflects the request's Origin into Access-Control-Allow-Origin, so a
  // cached entry is only valid for the origin that requested it. Accept-Encoding is
  // listed because API Gateway now varies the body by compression.
  response.headers['Vary'] = 'Origin, Accept-Encoding'

  // Skips re-sending the payload once the client already has this exact copy. The
  // query and serialization still run -- the body is what the ETag is computed from
  // -- so this cuts transfer, not Lambda time.
  if (matchesETag(getHeader(event, 'if-none-match'), etag)) {
    response.statusCode = 304
    response.body = ''
    return response
  }

  response.headers['Content-Type'] = 'application/json'
  response.body = body
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
