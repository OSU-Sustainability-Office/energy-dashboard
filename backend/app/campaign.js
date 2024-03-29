/*
 * @Author: Brogan & Jack Woods
 * @Date:   Tuesday January 28 2020
 * @Last Modified By:  Jack Woods
 * @Last Modified Time:  Tuesday January 28 2020
 * @Copyright:  (c) Oregon State University 2020
 */

const Campaign = require('/opt/nodejs/models/campaign.js')
const Response = require('/opt/nodejs/response.js')
const User = require('/opt/nodejs/user.js')
const DB = require('/opt/nodejs/sql-access.js')

// Retrieves a listing of all campaigns from the database, constructs an array of database class instances, and returns the array.
exports.all = async (event, context) => {
  // Create the response object
  let response = new Response(event)

  // Connect to the database
  await DB.connect()

  // Construct a list of campaign IDs
  let campaignIDList = await DB.query('SELECT id FROM campaigns')

  // Construct an array of campaigns using the campaign class
  let campaigns = []
  for (let i = 0; i < campaignIDList.length; i++) {
    let camp = await new Campaign(campaignIDList[i].id).get(false)
    campaigns.push(camp.data) // Finally add the campaign to the array
  }

  // JSON stringify the array of campaigns and return a response
  response.body = JSON.stringify(campaigns)
  return response
}

exports.get = async (event, context) => {
  let response = new Response(event)
  response.body = JSON.stringify((await new Campaign(event.queryStringParameters['id']).get()).data)
  return response
}

exports.post = async (event, context) => {
  let response = new Response(event)
  let user = new User(event, response)
  try {
    response.body = JSON.stringify(
      (
        await Campaign.create(
          event.body.name,
          event.body.dateStart,
          event.body.dateEnd,
          event.body.compareStart,
          event.body.compareEnd,
          event.body.media,
          event.body.buildings,
          user
        )
      ).data
    )
  } catch (err) {
    response.body = err.message
    response.status = 400
  }
}

exports.put = async (event, context) => {
  let response = new Response(event)
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
  let response = new Response(event)
  let user = new User(event, response)
  try {
    await Campaign(event.body.id).delete(user)
  } catch (error) {
    response.body = error.message
    response.status = 400
  }
  return response
}
