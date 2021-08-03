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

exports.data = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).download(
    event.queryStringParameters['point'],
    event.queryStringParameters['startDate'],
    event.queryStringParameters['endDate'],
    event.queryStringParameters['meterClass']
  )))
  return response
}

async function handleGeneralMeters (data, response) {
  const payload = JSON.parse(data)
  const meter_id = payload['id']
  const meter_data = payload['body']
  const pwd = payload['pwd']

  if (pwd !== process.env.ACQUISUITE_PASS) {
    return response
  }

  // Is the meter in the data-table?
  await DB.connect()
  let row = await DB.query('SELECT * from ? LIMIT 1', [meter_id])
  if (row.length === 0) {
    //  it isn't so let's add it!
    const point = meter_data[0]
    const schema = {}
    for (let field of Object.keys(point)) {
      if (field.toLower().contains('time')) {
        schema[field] = 'DATETIME'
      } else if (isNaN(point[field])) {
        schema[field] = 'TEXT'
      } else {
        schema[field] = 'DOUBLE'
      }
    }
    let query_string = 'CREATE TABLE ? (`id` int NOT NULL AUTO_INCREMENT,'
    const parameters = []
    for (let [field, datatype] of Object.entries(schema)) {
      query_string += '? ?,'
      parameters.push(field, datatype)
    }
    query_string += ')'
    try {
      await DB.query(query_string, parameters)
    } catch (err) {
      // DO something with error
    }
  }
  // upload meter data
  for (let point of meter_data) {
    const fields = []
    const readings = []
    const question_marks = []
    for (let [field, reading] of Object.keys(point)) {
      fields.push(field)
      readings.push(reading)
      question_marks.push('?')
    }
    const qs = question_marks.join(', ')
    let query_string = 'INSERT INTO ? (' + qs + ') VALUES (' + qs + ')'
    try {
      await DB.query(query_string, [meter_id, ...fields, ...readings])
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {}
    }
  }

  return response
}
/*
  This endpoint handles data uploads
*/
exports.post = async (event, context) => {
  let response = new Response(event)

  // check if request uses new meter upload method
  if (event.headers['SO-METERUPLOAD'] && event.headers['SO-METERUPLOAD'] === 'true') {
    return handleGeneralMeters(event.body, response)
  }

  // otherwise use "legacy" aquisuite support:
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
