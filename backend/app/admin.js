/*
 * @Author: you@you.you
 * @Date:   Saturday February 1st 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday February 1st 2020
 * @Copyright:  (c) Oregon State University 2020
 */
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const EUser = require('/opt/nodejs/models/user.js')

exports.users = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  await user.resolved
  response.body = await EUser.all(user)
  return response
}
