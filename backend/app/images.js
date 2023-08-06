require('dotenv').config({ path: '/opt/nodejs/.env' })
const AWS = require('/opt/nodejs/node_modules/aws-sdk')
AWS.config.update({ region: 'us-west-2' })
const S3 = new AWS.S3()
const Response = require('/opt/nodejs/response.js')

exports.all = async (event, context) => {
  const params = {
    Bucket: 'osu-energy-images'
  }
  let images = await new Promise((resolve, reject) => {
    S3.listObjects(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
  images = images.Contents.filter(image => image.Key.split('/').length === 1)
  let response = new Response(event)
  response.body = JSON.stringify(images.map(o => o.Key))
  return response
}
