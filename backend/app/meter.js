/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Meter = require('/opt/nodejs/models/meter.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const MultipartParse = require('aws-lambda-multipart-parser')
const ZLib = require('zlib')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.data = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).download(
    event.queryStringParameters['point'],
    event.queryStringParameters['startTime'],
    event.queryStringParameters['endTime'],
    event.queryStringParameters['meterClass']
  )))
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  const file = MultipartParse(event, true)

  if (event.body.MODE !== 'LOGFILEUPLOAD') {
    response.body = '<pre>\nSUCCESS\n</pre>'
    return response
  }

  if (event.body.PASSWORD === process.env.ACQUISUITE_PASS) {
    response.body = '<pre>\nSUCCESS\n</pre>'
    let meter
    try {
      meter = await Meter(null, event.body.SERIALNUMBER + '_' + event.body.MODBUSDEVICE).get()
    } catch (err) {
      if (err.name === 'MeterNotFound') {
        meter = await Meter.create(event.body.MODBUSDEVICENAME, event.body.SERIALNUMBER + '_' + event.body.MODBUSDEVICE, event.body.MODBUSDEVICECLASS)
      } else {
        response.body = '<pre>\nFAILURE\n</pre>'
        return response
      }
    }
    let table = await new Promise((resolve, reject) => {
      ZLib.unpack(file.file.content.data, (error, result) => {
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
        meter.upload(cols)
      }
    }
  } else {
    response.body = '<pre>\nFAILURE\n</pre>'
  }
  return response
}

exports.put = async (event, context) => {
  let response = new Response()
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
  let response = new Response()
  let user = new User(event, response)
  try {
    await Meter(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
