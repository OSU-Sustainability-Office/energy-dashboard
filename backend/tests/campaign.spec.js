/*
* @Author: Milan Donhowe
* @Date:   4/25/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/25/2021
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for campaign.js, "campaigns" endpoint
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

// stub user module
jest.mock('/opt/nodejs/user.js', () => {null}, {virtual:true})

// Mock Campaign Model Module
const mockCampaign = require('../dependencies/nodejs/models/campaign.js')
jest.mock(
    '/opt/nodejs/models/campaign.js',
    () => { return mockCampaign },
    {virtual: true}
)

/* Mock MySQL Database */
const csvHelper = require('./utility/csv_to_obj.js')
let mockSQLResponses = [
    [{id:3}],
    csvHelper.csv2object('./tests/assertedData/sql_mock_campaigns.csv')
]

jest.mock(
    '/opt/nodejs/sql-access.js',
    () => {return {
        query_index: 0,
        // claim db is up
        connect: async () => { return Promise.resolve() },
        // return mock sql data
        query: async () => {
            return Promise.resolve(mockSQLResponses.shift())
        }
    }},
    {virtual: true}
)

// Lambda function
const CampaignGetAll = require('../app/campaign.js')

describe('Testing campaigns endpoint...', () => {

    let response

    it('Can get campaigns...', async () => {
        response = await CampaignGetAll.all(MOCK_REQUEST_EVENT)
        const jsonData = JSON.parse(response.body)[0]
        // id should be number
        expect(isNaN(jsonData['id'])).not.toBe(true)
        // group ids should be numbers
        for (let id of jsonData['meterGroupIDs']){
            expect(isNaN(id)).not.toBe(true)
        }
        // compare time stamps (slice to get rid of extraneous quotes)
        expect(Date.parse(jsonData['dateStart'].slice(1, -1))).not.toBe(NaN)
        expect(Date.parse(jsonData['dateEnd'].slice(1, -1))).not.toBe(NaN)
        expect(Date.parse(jsonData['compareStart'].slice(1, -1))).not.toBe(NaN)
        expect(Date.parse(jsonData['compareEnd'].slice(1, -1))).not.toBe(NaN)
    })

    it ('campaigns returns CORS headers...', async () => {
        const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })

})

