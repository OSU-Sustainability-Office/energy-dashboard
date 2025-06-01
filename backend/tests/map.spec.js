/*
 * @Author: Milan Donhowe
 * @Date:   4/23/2021
 * @Copyright:  Oregon State University 2021
 * @Description: Unit tests for API endpoints associated with
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
})
