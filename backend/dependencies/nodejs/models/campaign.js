/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */
import { connect, query } from '/opt/nodejs/sql-access.js'
// const Building = require('/opt/nodejs/models/building.js')

class Campaign {
  constructor (id) {
    this.id = id
    this.buildings = []
    this.dateStart = ''
    this.dateEnd = ''
    this.compareStart = ''
    this.compareEnd = ''
    this.name = ''
    this.media = ''
    this.meterGroupIDs = []
  }

  // Queries the database for this campaign's data, and returns the data.
  async get (expand = true) {
    await connect()
    // Query for this particular campaign, groups, and buildings
    let campaignRows = await query(
      'SELECT campaigns.media, campaigns.id, campaigns.name, campaigns.date_start, campaigns.date_end, campaigns.compare_start, campaigns.compare_end, campaign_groups.group_id FROM campaigns LEFT JOIN campaign_groups ON campaigns.id = campaign_groups.campaign_id WHERE campaigns.id = ?',
      [this.id]
    )
    this.dateStart = campaignRows[0]['date_start']
    this.dateEnd = campaignRows[0]['date_end']
    this.compareEnd = campaignRows[0]['compare_end']
    this.compareStart = campaignRows[0]['compare_start']
    this.name = campaignRows[0]['name']
    this.media = campaignRows[0]['media']
    // for (let row of campaignRows) this.meterGroupIDs.push(row['group_id'])

    // If expand is true, include building information
    // if (expand === true) {
    //   // Iterate over each building in the campaign, and retrieve the building's
    //   // data by instantiating a Building object.
    //   for (let row of campaignRows) {
    //     // Each instance of the building class is a promise that is resolved async
    //     this.buildings.push(new Building(row['building_id']).get())
    //   }
    //   // await all of the building promises
    //   this.buildings = await Promise.all(this.buildings)
    // } else {
    //   // If the user does not wish to expand, just return the building's id
    //   this.buildings = campaignRows.map(row => row['building_id'])
    // }
    this.meterGroupIDs = campaignRows.map(row => row['group_id'])
    return this
  }

  get data () {
    return {
      id: this.id,
      // buildings: this.buildings,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      compareStart: this.compareStart,
      compareEnd: this.compareEnd,
      name: this.name,
      media: this.media,
      meterGroupIDs: this.meterGroupIDs
    }
  }
}

export default Campaign
