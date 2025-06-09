/*
 * Filename: app/campaign.js
 * Description: API endpoints related to campaigns
 */
import Campaign from '/opt/nodejs/models/campaign.js'
import Response from '/opt/nodejs/response.js'
import { connect, query } from '/opt/nodejs/sql-access.js'

// Retrieves a listing of all campaigns from the database, constructs an array of database class instances, and returns the array.
export async function all(event, context) {
  // Create the response object
  let response = new Response(event)

  // Connect to the database
  await connect()

  // Construct a list of campaign IDs
  let campaignIDList = await query('SELECT id FROM campaigns')

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
