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

/* Lambda Common Layer mocks */
const mockResponse = require(`${testConfig.so_namespace}/response.js`)
jest.mock(
    '/opt/nodejs/response.js',
    () => { return mockResponse },
    {virtual: true}
)

// stub un-used requires
jest.mock('/opt/nodejs/user.js', () => {null}, {virtual:true})
jest.mock('/opt/nodejs/node_modules/aws-lambda-multipart-parser', 
    () => {null}, 
    {virtual: true}
)


// Mock dashboard specific dependencies
const modelMocks = [
    'meter_classes.js', 
    'models/meter.js', 
    'models/meter_group.js'
]
for (modelMock of modelMocks){
    const mock = require(`../dependencies/nodejs/${modelMock}`)
    jest.mock(
        `/opt/nodejs/${modelMock}`,
        () => {return mock},
        {virtual: true}
    ) 
}

/* Mock MySQL Database */
const csvHelper = require('./utility/csv_to_obj.js')
let mockSQLResponse = csvHelper.csv2object('./tests/assertedData/sql_mock_meter_download.csv')

jest.mock(
    '/opt/nodejs/sql-access.js',
    () => {return {
        // claim db is up
        connect: async () => { return Promise.resolve() },
        // return mock sql data
        query: async () => { 
            return Promise.resolve(mockSQLResponse)
        }
    }},
    {virtual: true}
)

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