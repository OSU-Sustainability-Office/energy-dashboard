/*
* @Author: Milan Donhowe
* @Date Created:   5/3/2021
* @Copyright:  Oregon State University 2021
* @Description: This script runs before each test suite and mocks all the lambda common layer
*               related functions.
*/

const testConfig = require('./assertedData/test_config.json')

/* Lambda Common Layer mocks */
const mockResponse = require(`${testConfig.so_namespace}/response.js`)
jest.mock(
    '/opt/nodejs/response.js',
    () => { return mockResponse },
    {virtual: true}
)

// stub un-used requires
jest.mock('/opt/nodejs/user.js', () => {null}, {virtual:true})
jest.mock(
    '/opt/nodejs/node_modules/aws-lambda-multipart-parser', 
    () => {null}, 
    {virtual: true}
)

/**
    Mock MySQL Database w/ sqlite
*/
const sqlite3 = require('sqlite3')
const sql_utility = require('./utility/sql_test_utility.js')

const DB =  new sqlite3.Database('./tests/assertedData/test.db', sqlite3.OPEN_READWRITE)

const mockDB = {
    connect: () => { return Promise.resolve()},
    // Call sqlite query equivalent
    query: (req, params) => {
        let query = sql_utility.fixSQLKeywords(req)
        return new Promise((resolve, reject) => {
            DB.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            })
        })
    }
}

jest.mock(
    '/opt/nodejs/sql-access.js',
    () => { return mockDB },
    {virtual: true}
)

// Mock dashboard specific dependencies
const modelMocks = [
    'meter_classes.js', 
    'models/meter.js', 
    'models/meter_group.js', 
    'models/building.js', 
    'models/campaign.js'
]
for (modelMock of modelMocks){
    const mock = require(`../dependencies/nodejs/${modelMock}`)
    jest.mock(
        `/opt/nodejs/${modelMock}`,
        () => {return mock},
        {virtual: true}
    ) 
}
