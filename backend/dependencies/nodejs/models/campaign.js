/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */
const DB = require('/opt/nodejs/sql-access.js')
const Building = require('/opt/nodejs/models/building.js')

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
  }

  static async create (name, dateStart, dateEnd, compareStart, compareEnd, media, buildings, user) {
    if (user.data.privilege <= 3) {
      throw new Error('User does not have privelege to create campaigns')
    }
    await DB.connect()
    let insertRow = await DB.query('INSERT INTO campaigns (date_start, date_end, compare_start, compare_end, media, name) VALUES (?, ?, ?, ?, ?, ?)', [dateStart, dateEnd, compareStart, compareEnd, media, name])
    let campaign = Campaign(insertRow[0]['insert_id'])
    campaign.dateStart = dateStart
    campaign.dateEnd = dateEnd
    campaign.compareEnd = compareStart
    campaign.compareStart = compareEnd
    campaign.name = name
    campaign.media = media
    campaign.buildings = buildings
    let promises = []
    for (let building of buildings) {
      promises.push(DB.query('INSERT INTO campaign_groups (building_id, campaign_id) VALUES (?, ?)', [building, this.id]))
    }
    await Promise.all(promises)
    return campaign
  }

  async get (expand = true) {
    await DB.connect()
    let campaignRows = await DB.query('SELECT * FROM campaigns RIGHT JOIN campaign_groups ON campaigns.id = campaign_groups.campaign_id WHERE campaigns.id = ?', [this.id])
    this.dateStart = campaignRows[0]['date_start']
    this.dateEnd = campaignRows[0]['date_end']
    this.compareEnd = campaignRows[0]['compare_end']
    this.compareStart = campaignRows[0]['compare_start']
    this.name = campaignRows[0]['name']
    this.media = campaignRows[0]['media']
    if (expand === true) {
      for (let row of campaignRows) {
        this.buildings.push(new Building(row['building_id']).get())
      }
      this.buildings = await this.buildings // Brogans suggestion is to make the route in the campaign object. Run queries in here and not in lambda code
    } else {
      this.buildings = campaignRows.map(row => row['building_id'])
    }
    return this
  }

  async delete (user) {
    if (user.privilege > 3) {
      await DB.query('DELETE campaigns WHERE id = ?', [this.id])
    } else {
      throw new Error('User can not delete campaign')
    }
  }

  async update (name, dateStart, dateEnd, compareStart, compareEnd, media, buildings, user) {
    if (user.data.privilege <= 3) {
      throw new Error('User does not have privelege to create campaigns')
    }
    await DB.connect()
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.compareEnd = compareStart
    this.compareStart = compareEnd
    this.name = name
    this.media = media
    this.buildings = buildings
    await DB.query('DELETE campaign_groups WHERE campaign_id = ?', [this.id])
    let promises = [DB.query('UPDATE campaigns SET date_start = ?, date_end = ?, compare_start = ?, compare_end = ?, name = ?, media = ? WHERE id = ?', [dateStart, dateEnd, compareStart, compareEnd, name, media, this.id])]
    for (let building of buildings) {
      promises.push(DB.query('INSERT INTO campaign_groups (building_id, campaign_id) VALUES (?, ?)', [building, this.id]))
    }
    await Promise.all(promises)
    return this
  }

  get
  data () {
    return {
      id: this.id,
      buildings: this.buildings,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      compareStart: this.compareStart,
      compareEnd: this.compareEnd,
      name: this.name,
      media: this.media
    }
  }
}

module.exports = Campaign
