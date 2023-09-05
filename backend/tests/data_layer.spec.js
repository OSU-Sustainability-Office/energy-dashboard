/*
* Filename: data_layer.spec.js
* Description: Unit tests for API endpoints associated with
*               the data_layer (or data_store) VueX module
*/

// CORS testing utility requires
const testConfig = require('./assertedData/test_config.json')
const CORSUtil = require('./utility/cors_test_utility.js')
const server = testConfig['serverOrigin']
const client = testConfig['clientOrigin']
const solarData = require('./assertedData/mock_solar_data.json')
const DB = require('/opt/nodejs/sql-access.js')

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

// Lambda functions
const RemoteSystemNow = require('../app/now.js')
const MeterData = require('../app/meter.js')

// The unit tests
describe('Testing data_layer related API endpoints...', () => {
  let response

  it('/systemtime should return valid timestamp (number)', async () => {
    response = await RemoteSystemNow.systemtime(MOCK_REQUEST_EVENT)
    expect(isNaN(response.body)).toBe(false)
  })

  it('/systemtime should return proper CORS headers', () => {
    const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
    try {
      expect(corsResult.result).toBe(true)
    } catch {
      throw new Error(corsResult.reason)
    }
  })

  it('/data should return data...', async () => {
    response = await MeterData.data(MOCK_REQUEST_EVENT)
    const jsonData = JSON.parse(response.body)
    expect(jsonData.length).toBeGreaterThan(5)
  })

  it('/data should return CORS headers...', async () => {
    const corsResult = CORSUtil.VerifyCORSResponse(response, client, server)
    try {
      expect(corsResult.result).toBe(true)
    } catch {
      throw new Error(corsResult.reason)
    }
  })

  it('/batchData should return data for multiple metres...', async () => {
    /*
      Ok, assume a batch request involves the same point & meter class
      {
        point,
        meterClass,
        datasets [{
          id,
          startDate,
          endDate
        }]
      }
    */
    const batchRequest = {
      headers: {
        ...MOCK_REQUEST_EVENT.headers
      },
      body: JSON.stringify({
        point: 'accumulated_real',
        meterClass: 5,
        datasets: [
          { id: 92, startDate: 1641684600, endDate: 1642207500 },
          { id: 93, startDate: 1641684600, endDate: 1642207500 }
        ]
      })
    }
    response = await MeterData.batchData(batchRequest)
    const jsonData = JSON.parse(response.body)
    // Response should be of type:
    /*
    {
      data: [{
        id: <id>,
        readings: [{time, reading}]
      },...]
    }
    */
    expect(jsonData['data'].length).toBe(2)
    expect(jsonData['data'][0]['readings'].length).toBeGreaterThan(10)
    expect(jsonData['data'][1]['readings'].length).toBeGreaterThan(10)

  })
  const meter_id = 'Solar_Meters'
  it('mock solar data upload...', async () => {
    process.env.ACQUISUITE_PASS = 'test_pwd'
    // Have to make meter_id acceptable for SQL commands
    const mockRequest = {
      headers: {
        ...MOCK_REQUEST_EVENT.headers
      },
      body: JSON.stringify({
        id: meter_id,
        body: solarData,
        pwd: process.env.ACQUISUITE_PASS,
        type: 'solar'
      })
    }
    // Check that we can upload data
    let response = await MeterData.upload(mockRequest, undefined)
    expect(response.statusCode).toBe(200)
    /*
    // Check that data was written
    let energy_data = await DB.query('SELECT * from ' + meter_id)
    expect(energy_data.length).toBe(solarData.length)
    // Check that meter was added to Meters table
    const [{ 'id': meter_normalized_id }] = await DB.query('SELECT id FROM meters WHERE name = ?;', [meter_id])

    // Check that we can GET data
    const mockReadRequest = {
      headers: {
        origin: `${client.scheme}://${client.host}`
      },
      queryStringParameters: {
        'id': meter_normalized_id,
        'point': 'total_energy',
        'startDate': 1693785599,
        'endDate': 1693785600,
        'meterClass': 9990001
      }
    }
    let EnergyResponse = await MeterData.data(mockReadRequest)
    const meter_data = JSON.parse(EnergyResponse.body)
    expect(meter_data.length).toBe(solarData.length)
    expect(meter_data[0]['total_energy']).toBe(3665740)
    // Make sure batch route works too
    const batchRequest = {
      headers: {
        ...MOCK_REQUEST_EVENT.headers
      },
      body: JSON.stringify({
        point: 'total_energy',
        meterClass: 9990001,
        datasets: [
          { id: meter_normalized_id, startDate: 1627974000, endDate: 1627976700 }
        ]
      })
    }

    response = await MeterData.batchData(batchRequest)
    const jsonData = JSON.parse(response.body)
    console.log(jsonData)
    expect(jsonData['data'][0]['readings'].length).toBe(solarData.length)
    expect(jsonData['data'][0]['readings'][0]['reading']).toBe(3665740)
    */
  })
/*
  const meter_id = 'M' + '007c9349-72ba-450c-aa1f-4e5a77b68f79'.replace(/-/g, 'M')
  it('mock solar data upload...', async () => {
    process.env.ACQUISUITE_PASS = 'test_pwd'
    // Have to make meter_id acceptable for SQL commands
    const mockRequest = {
      headers: {
        ...MOCK_REQUEST_EVENT.headers
      },
      body: JSON.stringify({
        id: meter_id,
        body: solarData,
        pwd: process.env.ACQUISUITE_PASS,
        type: 'solar'
      })
    }
    // Check that we can upload data
    let response = await MeterData.upload(mockRequest, undefined)
    expect(response.statusCode).toBe(200)
    // Check that data was written
    let energy_data = await DB.query('SELECT * from ' + meter_id)
    expect(energy_data.length).toBe(solarData.length)
    // Check that meter was added to Meters table
    const [{ 'id': meter_normalized_id }] = await DB.query('SELECT id FROM meters WHERE name = ?;', [meter_id])

    // Check that we can GET data
    const mockReadRequest = {
      headers: {
        origin: `${client.scheme}://${client.host}`
      },
      queryStringParameters: {
        'id': meter_normalized_id,
        'point': 'total_energy',
        'startDate': 1627974000,
        'endDate': 1627976700,
        'meterClass': 9990001
      }
    }
    let EnergyResponse = await MeterData.data(mockReadRequest)
    const meter_data = JSON.parse(EnergyResponse.body)
    expect(meter_data.length).toBe(solarData.length)
    expect(meter_data[0]['total_energy']).toBe(3665740)
    // Make sure batch route works too
    const batchRequest = {
      headers: {
        ...MOCK_REQUEST_EVENT.headers
      },
      body: JSON.stringify({
        point: 'total_energy',
        meterClass: 9990001,
        datasets: [
          { id: meter_normalized_id, startDate: 1627974000, endDate: 1627976700 }
        ]
      })
    }

    response = await MeterData.batchData(batchRequest)
    const jsonData = JSON.parse(response.body)
    console.log(jsonData)
    expect(jsonData['data'][0]['readings'].length).toBe(solarData.length)
    expect(jsonData['data'][0]['readings'][0]['reading']).toBe(3665740)
  })
  */
})
