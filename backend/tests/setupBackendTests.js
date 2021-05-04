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
jest.mock('/opt/nodejs/node_modules/aws-lambda-multipart-parser', 
    () => {null}, 
    {virtual: true}
)

// Mock DB using sqlite
const sqlite3 = require('sqlite3')

const mockDB = {
    DB: new sqlite3.Database('assertedData/test.db'),
    connect: () => { return Promise.resolve()},
    query: (req) => {
        // call sqlite3 version of query
    }
}


jest.mock('/opt/nodejs/sql-access.js',
    () => {return null},
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
