/*
 * @Author: Milan Donhowe
 * @Date Created:   5/3/2021
 * @Copyright:  Oregon State University 2021
 * @Description: This script runs before each test suite and mocks all the lambda common layer
 *               related functions.
 */

import config from './assertedData/test_config.json' assert { type: 'json' }
const { so_namespace } = config
import { vi } from 'vitest'

/* Lambda Common Layer mocks */
const mockResponse = await import(`${so_namespace}/response.js`)
vi.mock(
  '/opt/nodejs/response.js',
  () => {
    return mockResponse
  },
  { virtual: true }
)

// stub un-used requires
vi.mock(
  '/opt/nodejs/user.js',
  () => {
    null
  },
  { virtual: true }
)
vi.mock(
  '/opt/nodejs/node_modules/aws-lambda-multipart-parser',
  () => {
    null
  },
  { virtual: true }
)

/**
    Mock MySQL Database
**/
import { createConnection } from 'mysql'
const DB = createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: 'password',
  database: 'energy',
  multipleStatements: false // it's disabled by default in common layer db class
})

const mockDB = {
  connect: () => {
    return Promise.resolve()
  },
  query: (query, params) => {
    return new Promise((resolve, reject) => {
      DB.query(query, params, (err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }
}

vi.mock(
  '/opt/nodejs/sql-access.js',
  () => {
    return mockDB
  },
  { virtual: true }
)

// Mock dashboard specific dependencies
const modelMocks = [
  'meter_classes.js',
  'models/meter.js',
  'models/meter_group.js',
  'models/building.js',
  'models/campaign.js',
  'models/compress.js'
]
for (const modelMock of modelMocks) {
  const mock = await import(`../dependencies/nodejs/${modelMock}`)
  vi.mock(
    `/opt/nodejs/${modelMock}`,
    () => {
      return mock
    },
    { virtual: true }
  )
}
