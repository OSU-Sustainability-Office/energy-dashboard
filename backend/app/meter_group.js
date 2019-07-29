/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  (c) Your Company 2019
 */

const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new MeterGroup(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    response.body = JSON.stringify((await MeterGroup.create(
      event.body.name,
      event.body.meters,
      user
    )).data)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}

exports.put = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    await MeterGroup(event.body.id).update(
      event.body.name,
      event.body.meters,
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
    await MeterGroup(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
