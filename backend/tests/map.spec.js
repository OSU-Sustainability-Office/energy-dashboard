/*
 * Filename: map.spec.js
 * Description: Unit tests for API endpoints associated with
 *               the frontend Map VueX module
 */
import testConfig from './assertedData/test_config.json'
import { VerifyCORSResponse } from './utility/cors_test_utility.js'
const server = testConfig['serverOrigin']
const client = testConfig['clientOrigin']

const MOCK_REQUEST_EVENT = {
  headers: {
    origin: `${client.scheme}://${client.host}`
  }
}

import { all } from '../app/building.js'

describe('Testing map.module.js related API endpoints...', () => {
  let response

  it('/allbuildings returns substantial data', async () => {
    response = await all(MOCK_REQUEST_EVENT)
    const jsonData = JSON.parse(response.body)
    expect(jsonData.length).toBeGreaterThan(5)
  })

  it('/allbuildings returns CORS headers', async () => {
    const corsResult = VerifyCORSResponse(response, client, server)
    try {
      expect(corsResult.result).toBe(true)
    } catch {
      throw new Error(corsResult.reason)
    }
  })

  it('/allbuildings is revalidated rather than served from a staleness window', async () => {
    // max-age must stay 0 -- buildings are edited by direct SQL, so nothing in the
    // app can invalidate a cached copy. Any non-zero value silently delays admin
    // changes by that long.
    expect(response.headers['Cache-Control']).toContain('max-age=0')
    expect(response.headers['Cache-Control']).toContain('stale-while-revalidate=')
  })

  it('/allbuildings varies on Origin so a cached copy cannot leak across origins', async () => {
    // Response echoes the request Origin into Access-Control-Allow-Origin.
    expect(response.headers['Vary']).toContain('Origin')
    expect(response.headers['Vary']).toContain('Accept-Encoding')
  })

  it('/allbuildings returns a stable ETag across identical requests', async () => {
    const second = await all(MOCK_REQUEST_EVENT)
    expect(response.headers['ETag']).toBeTruthy()
    expect(second.headers['ETag']).toBe(response.headers['ETag'])
  })

  it('/allbuildings answers 304 with no body when the client already has that ETag', async () => {
    const conditional = await all({
      headers: { ...MOCK_REQUEST_EVENT.headers, 'If-None-Match': response.headers['ETag'] }
    })
    expect(conditional.statusCode).toBe(304)
    expect(conditional.body).toBe('')
    // A 304 still has to carry the validator and the caching directives.
    expect(conditional.headers['ETag']).toBe(response.headers['ETag'])
    expect(conditional.headers['Cache-Control']).toBe(response.headers['Cache-Control'])
  })

  it('/allbuildings tolerates weak validators and multi-value If-None-Match', async () => {
    const conditional = await all({
      headers: { ...MOCK_REQUEST_EVENT.headers, 'if-none-match': `"stale-one", W/${response.headers['ETag']}` }
    })
    expect(conditional.statusCode).toBe(304)
  })

  it('/allbuildings sends the full body when the ETag does not match', async () => {
    const conditional = await all({
      headers: { ...MOCK_REQUEST_EVENT.headers, 'If-None-Match': '"not-the-current-etag"' }
    })
    expect(conditional.statusCode).toBe(200)
    expect(JSON.parse(conditional.body).length).toBeGreaterThan(5)
  })
})
