/*
* @Author: Milan Donhowe
* @Date:   4/23/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/23/2021
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for building.js, "allbuildings" endpoint
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

const csvHelper = require('./utility/csv_to_obj.js')
let mockSQLResponse = csvHelper.csv2object('./tests/assertedData/sql_mock_allbuildings.csv')


/* Lambda Common Layer mocks */
const mockResponse = require(`${testConfig.so_namespace}/response.js`)
jest.mock(
    '/opt/nodejs/response.js',
    () => { return mockResponse },
    {virtual: true}

)

/* Mock MySQL Database */
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

// Mock dashboard specific dependencies
const modelMocks = ['meter_classes.js', 'models/meter.js', 'models/meter_group.js', 'models/building.js']
for (modelMock of modelMocks){
    const mock = require(`../dependencies/nodejs/${modelMock}`)
    jest.mock(
        `/opt/nodejs/${modelMock}`,
        () => {return mock},
        {virtual: true}
    ) 
}
 
// stub "User" module (not currently used by endpoint)
jest.mock('/opt/nodejs/user.js', () => {null}, {virtual:true})

const AllBuildings = require('../app/building.js')

describe('Testing allbuildings endpoint...', () => {
    
    let response

    it ('Can get data from SQL query', async () => {
        response = await AllBuildings.all(MOCK_REQUEST_EVENT)
        const jsonData = JSON.parse(response.body)
        expect(jsonData.length).toBeGreaterThan(5)
    })

    it ('allbuildings returns CORS headers', async () => {
        const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
        try {
            expect(corsResult.result).toBe(true)
        } catch {
            throw new Error(corsResult.reason)
        }
    })

})