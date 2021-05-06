/*
* @Author: Milan Donhowe
* @Date:   4/23/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/25/2021
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for meter.js, "data" endpoint
*/

/* CORS testing imports */
const testConfig = require('./assertedData/test_config.json')
const CORSUtil = require('./utility/cors_test_utility.js')
const server = testConfig['serverOrigin']
const client = testConfig['clientOrigin']

const MOCK_REQUEST_EVENT = {
    headers: {
        origin: `${client.scheme}://${client.host}`
    },
    queryStringParameters: {
        'id': 9,
        'point': 'accumulated_real',
        'startDate': 1603854900,
        'endDate': 1613618100,
        'meterClass': 48
    }
}

// Lambda function
const MeterData = require('../app/meter.js')


// Actual jest tests
describe('Testing meters endpoint', () => {

    let response

    it('Can get data from endpoint...', async () => {
        response = await MeterData.data(MOCK_REQUEST_EVENT)
        const jsonData = JSON.parse(response.body)
        expect(jsonData.length).toBeGreaterThan(5)
    })

    it('data returns CORS headers...', async () => { 
        const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })

})