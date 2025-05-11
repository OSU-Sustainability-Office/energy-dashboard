/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const Response = require('/opt/nodejs/response.js')

exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await new MeterGroup(event.queryStringParameters['id']).get()).data)
  return response
}
