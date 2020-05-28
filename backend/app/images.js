/*
 * @Author: you@you.you
 * @Date:   Saturday January 11th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday January 11th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
require('dotenv').config({ path: '/opt/nodejs/.env' })
const AWS = require('/opt/nodejs/node_modules/aws-sdk')
AWS.config.update({ region: 'us-west-2' })
const S3 = new AWS.S3()
const Response = require('/opt/nodejs/response.js')
// const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response(event)

  let prepath = 'fullSize/'
  if (event.queryStringParameters['size'] && parseInt(event.queryStringParameters['size']) === 2) {
    prepath = 'thumbnails/'
  }

  const params = {
    Bucket: 'osu-energy-images',
    Key: prepath + event.queryStringParameters['name']
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
  images = images.Contents.filter(image => image.Key.split('/').length === 1)
  let response = new Response(event)
  response.body = JSON.stringify(images.map(o => o.Key))
  return response
}
