/*
* @Author: Milan Donhowe
* @Date:   4/23/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/23/2021
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for now.js, "systemtime" endpoint
*/

/* CORS testing imports */
const testConfig = require('./assertedData/test_config.json')
const CORSUtil = require('./utility/cors_test_utility.js')
const server = testConfig['serverOrigin']
const client = testConfig['clientOrigin']

const MOCK_REQUEST_EVENT = {
    headers: {
        origin: `${client.scheme}://${client.host}`
    }
}
/* Lambda Common Layer mocks */
const mockResponse = require(`${testConfig.so_namespace}/response.js`)
jest.mock(
    '/opt/nodejs/response.js',
    () => { return mockResponse },
    {virtual: true}
)

const RemoteSystemNow = require('../app/now.js')

describe('Testing systemtime endpoint...', () => {

    let test_response

    it('systemtime should return valid timestamp (number)', async () => {
        test_response = await RemoteSystemNow.systemtime(MOCK_REQUEST_EVENT)
        expect(isNaN(test_response.body)).toBe(false)

    })

    it('systemtime should return proper CORS headers', () => {
        const corsResult = CORSUtil.VerifyCORSResponse(test_response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })
})
