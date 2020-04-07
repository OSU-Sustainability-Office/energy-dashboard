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
const MultipartParse = require('/opt/nodejs/node_modules/aws-lambda-multipart-parser')
const ZLib = require('zlib')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.all = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  await user.resolved

  response.body = JSON.stringify(await Meter.all(user))

  return response
}

exports.data = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Meter(event.queryStringParameters['id'])).download(
    event.queryStringParameters['point'],
    event.queryStringParameters['startDate'],
    event.queryStringParameters['endDate'],
    event.queryStringParameters['meterClass']
  )))
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
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
