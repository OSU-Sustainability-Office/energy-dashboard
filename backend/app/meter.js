/* Filename: app/meter.js
 * Description: API endpoints related to meter data
 */
import { connect, query as _query } from '/opt/nodejs/sql-access.js'
import Meter, { create } from '/opt/nodejs/models/meter.js'
import Response from '/opt/nodejs/response.js'
import { parse } from '/opt/nodejs/node_modules/aws-lambda-multipart-parser'
import { unzip } from 'zlib'
import Compress from '/opt/nodejs/models/compress.js'

// Check integral parameters.
function parseParameters ({ id, startDate, endDate }) {
  return {
    id: parseInt(id, 10),
    startDate: parseInt(startDate, 10),
    endDate: parseInt(endDate, 10)
  }
}
function verifyParameters ({ id, startDate, endDate }) {
  return ![id, startDate, endDate].some(isNaN)
}

// Get data for multiple meters => {id -> [{}...], ...}
/*
  Ok, assume a multiMeter request involves the same point & meter class
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
export async function multiMeterData (event, context) {
  const request = JSON.parse(event.body)
  const meterList = request.datasets.map(parseParameters).filter(verifyParameters)
  const { point, meterClass } = request
  const response = new Response(event)
  response.body = { data: [] }
  // Get data for each Response [inefficient, should switch to transaction eventually]
  for (let query of meterList) {
    response.body.data.push({
      id: query.id,
      readings: await new Meter(query.id).sparseDownload(point, query.startDate, query.endDate, meterClass)
    })
  }
  response.body = JSON.stringify(response.body)
  return response //Compress(event, response)
}

// GET data for single meter
export async function data (event, context) {
  let response = new Response(event)
  response.body = JSON.stringify(
    await new Meter(event.queryStringParameters['id']).download(
      event.queryStringParameters['point'],
      event.queryStringParameters['startDate'],
      event.queryStringParameters['endDate'],
      event.queryStringParameters['meterClass']
    )
  )
  return response //Compress(event, response)
}

// Meter Data Upload Route (currently only for solar panels)
export async function upload (event, context) {
  let response = new Response(event)

  const payload = JSON.parse(event.body)
  const pwd = payload['pwd']
  const meter_id = payload['id']
  const meter_data = payload['body']
  const meter_type = payload['type']

  if (pwd !== process.env.ACQUISUITE_PASS) {
    response.statusCode = 400
    return response
  }

  await connect()
  try {
    await _query(`SHOW TABLES LIKE ?;`, [meter_id]) // Check if table exists
  } catch {
    response.statusCode = 400
    return response
  }

  let query_string = ''

  if (meter_type === 'solar') {
    let final_redundant_check = await _query('SELECT * FROM Solar_Meters WHERE MeterID = ? AND time_seconds = ?;', [
      meter_data.meterID,
      meter_data.time_seconds
    ])
    if (final_redundant_check.length === 0) {
      query_string = `INSERT INTO Solar_Meters (\`time\`, \`time_seconds\`, \`MeterID\`, \`MeterName\`, \`periodic_real_out\`) VALUES ('${meter_data.time}', '${meter_data.time_seconds}', '${meter_data.meterID}', '${meter_data.meterName}', '${meter_data.totalYield}');`
    } else {
      response.statusCode = 400
      response.body = 'redundant upload detected, skipping'
      return response
    }
  } else if (meter_type === 'pacific_power') {
    let final_redundant_check = await _query(
      'SELECT * FROM pacific_power_data WHERE pacific_power_meter_id = ? AND time_seconds = ?',
      [meter_data.pp_meter_id, meter_data.time_seconds]
    )
    if (final_redundant_check.length === 0) {
      query_string = `INSERT INTO pacific_power_data (\`time\`, \`time_seconds\`, \`pacific_power_meter_id\`, \`periodic_real_in\`) VALUES ('${meter_data.time}', '${meter_data.time_seconds}', '${meter_data.pp_meter_id}', '${meter_data.usage_kwh}');`
    } else {
      response.statusCode = 400
      response.body = 'redundant upload detected, skipping'
      return response
    }
  }

  try {
    await _query(query_string)
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') {
      response.statusCode = 400
      response.body = 'meter data does not fit database schema: ' + ', code: ' + err.code
      return response
    }
  }
  response.statusCode = 200
  return response
}
/*
  This endpoint handles data uploads from Aquisuites
*/
export async function post (event, context) {
  let response = new Response(event)

  event.body = Buffer.from(event.body, 'base64').toString('binary')
  const body = await parse(event, false)

  response.headers = {
    ...response.headers,
    'Content-Type': 'application/xml'
  }
  if (body.MODE !== 'LOGFILEUPLOAD') {
    response.body = '<pre>\nSUCCESS\n</pre>'
    return response
  }

  if (body.PASSWORD === process.env.ACQUISUITE_PASS) {
    response.body = '<pre>\nSUCCESS\n</pre>'
    let meter
    try {
      meter = await new Meter(null, body.SERIALNUMBER + '_' + body.MODBUSDEVICE).get()
    } catch (err) {
      if (err.name === 'MeterNotFound') {
        meter = await create(body.MODBUSDEVICENAME, body.SERIALNUMBER + '_' + body.MODBUSDEVICE, body.MODBUSDEVICECLASS)
      } else {
        console.log(err)
        response.body = '<pre>\nFAILURE\n</pre>'
        return response
      }
    }
    try {
      let table = await new Promise((resolve, reject) => {
        let file
        for (let object of Object.values(body)) {
          if (object.type && object.type === 'file') {
            file = object
            break
          }
        }
        if (!file) reject(new Error('File not found in request'))
        unzip(Buffer.from(file.content, 'binary'), (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.toString('ascii').split('\n'))
          }
        })
      })
      for (let entry of table) {
        let cols = entry.split(',')

        if (parseInt(cols[0].toString().substring(15, 17)) % 15 === 0) {
          await meter.upload(cols)
        }
      }
    } catch (err) {
      console.log(err)
      response.body = '<pre>\nFAILURE\n</pre>'
    }
  } else {
    response.body = '<pre>\nFAILURE\n</pre>'
  }
  return response
}
