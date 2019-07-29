/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Story = require('/opt/nodejs/models/story.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response()
  response.body = JSON.stringify((await (new Story(event.queryStringParameters['id'])).get()).data)
  return response
}

exports.user = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  response.body = JSON.stringify(await (Story.storiesForUser(user)).map(o => o.data))
  return response
}

exports.post = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  try {
    response.body = JSON.stringify((await Story.create(
      event.body.name,
      event.body.media,
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
    await Story(event.body.id).update(
      event.body.name,
      event.body.media,
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
    await Story(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
