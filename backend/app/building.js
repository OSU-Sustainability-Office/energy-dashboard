/*
 * @Author: Brogan
 * @Date:   Tuesday May 14th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Tuesday May 14th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Building = require('/opt/nodejs/models/building.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.all = async (event, context) => {
  let response = new Response()
  response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
  response.headers['Access-Control-Allow-Credentials'] = 'true'
  response.body = JSON.stringify((await Building.all()).map(o => o.data))
  return response
}

exports.get = async (event, context) => {
  let response = new Response()
  // response.headers['Access-Control-Allow-Origin'] = '*'
  response.body = JSON.stringify((await (new Building(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.put = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    await Building(event.body.id).update(
      event.body.mapId,
      event.body.image,
      event.body.group,
      user
    )
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    response.body = JSON.stringify((await Building.create(
      event.body.mapId,
      event.body.image,
      event.body.group,
      user
    )).data)
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
    await Building(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
