/*
* @Author: Milan Donhowe
* @Date Created:   5/6/2021
* @Last Modified By:  Milan Donhowe
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for API endpoints associated with
*               the data_layer (or data_store) VueX module
*/


// CORS testing utility requires
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

// Lambda functions
const RemoteSystemNow = require('../app/now.js')
const MeterData = require('../app/meter.js')

// The unit tests
describe('Testing data_layer related API endpoints...', () => {

    let response

    it('/systemtime should return valid timestamp (number)', async () => {
        response = await RemoteSystemNow.systemtime(MOCK_REQUEST_EVENT)
        expect(isNaN(response.body)).toBe(false)

    })

    it('/systemtime should return proper CORS headers', () => {
        const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })

    it('/data should return data...', async () => {
        response = await MeterData.data(MOCK_REQUEST_EVENT)
        const jsonData = JSON.parse(response.body)
        expect(jsonData.length).toBeGreaterThan(5)
    })

    it('/data should return CORS headers...', async () => { 
        const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })

})
