/*
  Filename: meter.js
  Description: API Endpoint logic for meter data upload & retrieval
 */

const DB = require('/opt/nodejs/sql-access.js')
const Meter = require('/opt/nodejs/models/meter.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const MultipartParse = require('/opt/nodejs/node_modules/aws-lambda-multipart-parser')
const ZLib = require('zlib')
const Compress = require('/opt/nodejs/models/compress.js')


exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.all = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  await user.resolved

  response.body = JSON.stringify(await Meter.all(user))

  return response
}

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
exports.batchData = async (event, context) => {
  const request = JSON.parse(event.body)
  const meterList = request.datasets
    .map(parseParameters)
    .filter(verifyParameters)
  const { point, meterClass } = request
  const response = new Response(event)
  response.body = { 'data': [] }
  // Get data for each Response [inefficient, should switch to transaction eventually]
  for (let query of meterList) {
    response.body.data.push({
      id: query.id,
      readings: await (new Meter(query.id)).sparseDownload(
        point, query.startDate, query.endDate, meterClass
      )
    })
  }
  response.body = JSON.stringify(response.body)
  return Compress(event, response)
}

// GET data for single meter
exports.data = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).download(
    event.queryStringParameters['point'],
    event.queryStringParameters['startDate'],
    event.queryStringParameters['endDate'],
    event.queryStringParameters['meterClass']
  )))
  return Compress(event, response)
}

// Meter Data Upload Route (currently only for solar panels)
exports.upload = async (event, context) => {
  let response = new Response(event)

  const payload = JSON.parse(event.body)

  const meter_type = payload['type']
  const meter_id = payload['id']
  const meter_data = payload['body']
  const pwd = payload['pwd']

  if (pwd !== process.env.ACQUISUITE_PASS) {
    response.statusCode = 400
    return response
  }

  // Check if meter_id is in meter table

  // Is the meter in the data-table?
  await DB.connect()
  let row = []
  try {
    row = await DB.query(`SHOW TABLES LIKE ?;`, [meter_id])
  } catch {}

  if (row.length === 0) {
    if (meter_type === 'solar') {
      // Make table w/ parameters
      try {
        await DB.query(`CREATE TABLE \`${meter_id}\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`time\` TEXT NOT NULL,
          \`time_seconds\` INT DEFAULT NULL,
          \`current\` FLOAT,
          \`voltage\` FLOAT,
          \`energy_change\` FLOAT,
          \`total_energy\` FLOAT,
          UNIQUE KEY \`time_seconds\` (\`time_seconds\`),
          PRIMARY KEY (\`ID\`)
        );`)
        await DB.query(`INSERT INTO meters (name, type, class) VALUES (?, ?, ?)`, [meter_id, 'E', '9990001'])
      } catch (err) {
        response.body = err
        response.statusCode = 500
        return response
      }
    } else {
      response.statusCode = 401
      return response
    }
  }

  // upload meter data
  for (let point of meter_data) {
    const fields = []
    const readings = []
    const question_marks = []
    for (let [field, reading] of Object.entries(point)) {
      fields.push(field)
      readings.push(reading)
      question_marks.push('?')
    }
    const qs = question_marks.join(', ')
    let query_string = (`INSERT INTO ${meter_id} (` + fields.map(x => `\`${x}\``).join(', ') + ') VALUES (' + qs + ')').replace(/\\r/g, '')
    try {
      await DB.query(query_string, readings)
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') {
        response.statusCode = 400
        response.body = 'meter data does not fit database schema: ' + JSON.stringify(point) + ', code: ' + err.code
        return response
      }
    }
  }

  response.statusCode = 200
  return response
}
/*
  This endpoint handles data uploads from Aquisuites
*/
exports.post = async (event, context) => {
  let response = new Response(event)

  event.body = Buffer.from(event.body, 'base64').toString('binary')
  const body = await MultipartParse.parse(event, false)

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
      meter = await (new Meter(null, body.SERIALNUMBER + '_' + body.MODBUSDEVICE)).get()
    } catch (err) {
      if (err.name === 'MeterNotFound') {
        meter = await Meter.create(body.MODBUSDEVICENAME, body.SERIALNUMBER + '_' + body.MODBUSDEVICE, body.MODBUSDEVICECLASS)
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
          if (object.type  && object.type === 'file') {
            file = object
            break
          }
        }
        if (!file) reject(new Error('File not found in request'))
        ZLib.unzip(Buffer.from(file.content, 'binary'), (error, result) => {
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

exports.put = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  try {
    await Meter(event.body.id).update(
      event.body.name,
      event.body.classInt,
      event.body.negate,
      user
    )
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}

exports.delete = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  try {
    await Meter(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
