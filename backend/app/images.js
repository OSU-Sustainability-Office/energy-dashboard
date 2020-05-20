/*
 * @Author: you@you.you
 * @Date:   Saturday January 11th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday January 11th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
require('dotenv').config({ path: '/opt/nodejs/.env' })
const AWS = require('/opt/nodejs/node_modules/aws-sdk')
const Jimp = require('/opt/nodejs/node_modules/jimp')
AWS.config.update({ region: 'us-west-2' })
const S3 = new AWS.S3()
const Response = require('/opt/nodejs/response.js')
// const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response(event)

  let size = event.queryStringParameters['size'] : '1'
  // This If statement is here solely to prevent any sort of injection. We always convert user input into something safe to run in aws.
  // Additionally, sizes of 1 and 2 were previously used for this api endpoint. The if statement is necessary for maintaining the legacy interface.
  if (parseInt(size) === 2) size = '/thumbnails/'
  else size = '/fullSize/'

  const params = {
    Bucket: 'osu-energy-images',
    Key: size + event.queryStringParameters['name']
  }
  let image
  try {
    image = await (new Promise((resolve, reject) => {
      S3.getObject(params, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    }))
  } catch (error) {
    response.status = 404
    return response
  }
  response.body = image.Body.toString('base64')
  response.headers['Content-Type'] = 'image/jpeg'
  response.isBase64Encoded =  true
  return response
}

exports.all = async (event, context) => {
  const params = {
    Bucket: 'osu-energy-images'
  }
  let images = await (new Promise((resolve, reject) => {
    S3.listObjects(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  }))
  let response = new Response(event)
  response.body = JSON.stringify(images.Contents.map(o => o.Key))
  return response
}
