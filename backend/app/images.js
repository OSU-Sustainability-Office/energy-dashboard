/*
 * @Author: you@you.you
 * @Date:   Saturday January 11th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday January 11th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
require('dotenv').config({ path: '/opt/nodejs/.env' })
const AWS = require('aws-sdk')
const Jimp = require('jimp')
AWS.config.update({ region: 'us-west-2' })
const S3 = new AWS.S3()
const Response = require('/opt/nodejs/response.js')
// const User = require('/opt/nodejs/user.js')

exports.get = async (event, context) => {
  let response = new Response()
  const params = {
    Bucket: 'osu-energy-images',
    Key: event.queryStringParameters['name']
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
  if (event.queryStringParameters['size']) {
    if (event.queryStringParameters['size'] > 2 || event.queryStringParameters['size'] <= 0) {
      response.status = 400
      return response
    }
    let jImage = await Jimp.read(image.Body)
    jImage.scale(Number(event.queryStringParameters['size']))
    response.body = await (new Promise((resolve, reject) => {
      jImage.getBase64(Jimp.AUTO, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    }))
    response.body = response.body.split(',')[1]
  } else {
    response.body = image.Body.toString('base64')
  }
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
  let response = new Response()
  response.body = JSON.stringify(images.Contents.map(o => o.Key))
  return response
}
