/*
 * @Author: Brogan
 * @Date:   Tuesday May 14th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Tuesday May 14th 2019
 * @Copyright:  (c) Oregon State University 2019
 */
const db = require('/opt/nodejs/dynamo-access.js')
exports.rds = async (event, context) => {
  ddb.initialize()
  let response
  try {
    let features = await ddb.query('sus_map').scan({
      'Select': 'ALL_ATTRIBUTES'
    })
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: features
      })
    }
  } catch (e) {
    console.error(e)
    return e
  }
  return response
}
