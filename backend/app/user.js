/*
 * @Author: Brogan
 * @Date:   Wednesday September 25th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Wednesday September 25th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const UserModel = require('/opt/nodejs/models/user.js')

exports.user = async (event, context) => {
  let response = new Response()
  let user = new User(event, response)
  let userModel = await (new UserModel(user.onid)).get()
  user.appData['energyDashboard'] = userModel.data
  response.body = JSON.stringify(user.data)
  return response
}
