/* Filename: setupBackendTests.js
 * Description: This script runs before each test suite and mocks all the lambda common layer
 *              related functions.
 */
import config from './assertedData/test_config.json' with { type: 'json' }
const { so_namespace } = config
import { vi } from 'vitest'

// Lambda Common Layer
const mockResponse = await import(`${so_namespace}/response.js`)
vi.mock(
  '/opt/nodejs/response.js',
  () => {
    return mockResponse
  },
  { virtual: true }
)

// mock the sql-access.js module to use a local MySQL connection
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

// mock dashboard specific dependencies
const modelMocks = [
  'meter_classes',
  'models/meter',
  'models/meter_group',
  'models/building',
  'models/campaign',
  'models/compress'
]
for (const fileName of modelMocks) {
  const virtualPath = `/opt/nodejs/${fileName}.js`
  const realPath = `../dependencies/nodejs/${fileName}.js`

  // maps the virtual path to the real path
  vi.doMock(virtualPath, async () => {
    const mod = await import(realPath)
    return mod
  })
}
