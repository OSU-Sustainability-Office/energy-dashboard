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
  { virtual: true }
)

// stub un-used requires
jest.mock('/opt/nodejs/user.js', () => { null }, { virtual: true })
jest.mock(
  '/opt/nodejs/node_modules/aws-lambda-multipart-parser',
  () => { null },
  { virtual: true }
)

/**
    Mock MySQL Database
**/
const mysql = require('mysql')
const DB =  mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: 'password',
  database: 'energy',
  multipleStatements: false // it's disabled by default in common layer db class 
})

const mockDB = {
  connect: () => { return Promise.resolve() },
  query: (query, params) => {
    return new Promise((resolve, reject) => {
      DB.query(query, params, (err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }
}

jest.mock(
  '/opt/nodejs/sql-access.js',
  () => { return mockDB },
  { virtual: true }
)

// Mock dashboard specific dependencies
const modelMocks = [
  'meter_classes.js',
  'models/meter.js',
  'models/meter_group.js',
  'models/building.js',
  'models/campaign.js'
]
for (modelMock of modelMocks) {
  const mock = require(`../dependencies/nodejs/${modelMock}`)
  jest.mock(
    `/opt/nodejs/${modelMock}`,
    () => { return mock },
    { virtual: true }
  )
}
