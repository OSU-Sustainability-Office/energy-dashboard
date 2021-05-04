/*
* @Author: Milan Donhowe
* @Date:   4/23/2021
* @Copyright:  Oregon State University 2021
* @Description: Unit tests for building.js, "allbuildings" endpoint
*/
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