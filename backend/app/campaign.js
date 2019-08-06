/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Campaign = require('/opt/nodejs/models/campaign.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Campaign(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    response.body = JSON.stringify((await Campaign.create(
      event.body.name,
      event.body.dateStart,
      event.body.dateEnd,
      event.body.compareStart,
      event.body.compareEnd,
      event.body.media,
      event.body.buildings,
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
    await Campaign(event.body.id).update(
      event.body.name,
      event.body.dateStart,
      event.body.dateEnd,
      event.body.compareStart,
      event.body.compareEnd,
      event.body.media,
      event.body.buildings,
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
    await Campaign(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}