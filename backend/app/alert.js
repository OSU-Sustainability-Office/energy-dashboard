/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  Oregon State University 2019
 */

const Alert = require('/opt/nodejs/models/alert.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Alert(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    response.body = JSON.stringify((await Alert.create(
      event.body.lowThreshold,
      event.body.highThreshold,
      event.body.point,
      event.body.meterId,
      user
    )).data)
  } catch (err) {
    response.body = err.message
    response.status = 400
  }
}

exports.put = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    await Alert(event.body.id).update(
      event.body.lowThreshold,
      event.body.highThreshold,
      event.body.point,
      event.body.meterId,
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
    await Alert(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
