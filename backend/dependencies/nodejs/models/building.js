/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const APIToken = require('/opt/nodejs/api.js')
const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const axios = require('axios')

class Building {
  constructor (id) {
    this.id = id
    this.mapId = ''
    this.image = ''
    this.meterGroups = []
    this.group = ''
    this.geoJSON = ''
    this.name = ''
  }

  async get (expand = true) {
    await DB.connect()
    let buildingRow = await DB.query('SELECT * FROM buildings WHERE id = ?', [this.id])
    this.mapId = buildingRow[0]['map_id']
    this.image = buildingRow[0]['image']
    this.group = buildingRow[0]['group']
    let meterGroupRows = await DB.query('SELECT id FROM meter_groups where building_id = ?', [this.id])
    if (expand) {
      for (let row of meterGroupRows) {
        this.meterGroups.push((new MeterGroup(row['id'])).get())
      }
      this.meterGroups = await Promise.all(this.meterGroups)
    } else {
      for (let row of meterGroupRows) {
        this.meterGroups.push(row['id'])
      }
    }
    return this
  }

  get
  data () {
    let meterGroups = this.meterGroups
    if (meterGroups.length > 0 && meterGroups[0] instanceof MeterGroup) {
      meterGroups = meterGroups.map(o => o.data)
    }
    return {
      id: this.id,
      meterGroups: meterGroups,
      mapId: this.mapId,
      image: this.image,
      group: this.group,
      geoJSON: this.geoJSON,
      name: this.name
    }
  }

  async update (mapId, image, group, user) {
    await DB.connect()
    if (user.data.privilege > 3) {
      await DB.query('UPDATE buildings SET map_id = ?, image = ?, group = ? WHERE id = ?', [mapId, image, group, this.id])
    } else {
      throw new Error('Need escalated permissions')
    }
    this.mapId = mapId
    this.image = image
    this.group = group
    return this
  }

  async delete (user) {
    await DB.connect()
    if (user.data.privilege > 3) {
      await DB.query('DELETE buildings WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated permissions')
    }
  }

  static async create (mapId, image, group, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    let buildingRow = await DB.query('INSERT INTO buildings (map_id, image) VALUES (?, ?)', [mapId, image])
    let building = Building(buildingRow['insert_id'])
    building.mapId = mapId
    building.image = image
    building.group = group
    return building
  }

  static async all () {
    await DB.connect()
    let buildings = {}
    let promiseChain1 = await Promise.all([DB.query('SELECT buildings.id, buildings.group, buildings.map_id, meter_groups.id as meter_group_id FROM buildings LEFT JOIN meter_groups on buildings.id = meter_groups.building_id_2'), APIToken()])
    const buildingRows = promiseChain1[0]
    const token = promiseChain1[1]
    const promiseChain2 = []
    for (let buildingRow of buildingRows) {
      if (buildings[buildingRow['id']]) {
        buildings[buildingRow['id']].meterGroups.push(buildingRow['meter_group_id'])
      } else {
        let building = new Building(buildingRow['id'])
        building.mapId = buildingRow['map_id']
        building.group = buildingRow['group']
        building.meterGroups = [buildingRow['meter_group_id']]
        promiseChain2.push(axios('https://api.oregonstate.edu/v1/locations/' + buildingRow['map_id'], { method: 'get', headers: { Authorization: 'Bearer ' + token } }).then(mapData => {
          building.geoJSON = mapData.data.data.attributes.geometry
          building.geoJSON.properties = {}
          building.geoJSON.properties.name = mapData.data.data.attributes.name
          building.geoJSON.properties.group = buildingRow['group']
          building.geoJSON.properties.id = building.id
          building.image = mapData.data.data.attributes.images[0]
          building.name = mapData.data.data.attributes.name
        }))
        buildings[buildingRow['id']] = building
      }
    }
    await Promise.all(promiseChain2)
    return Object.values(buildings)
  }
}

module.exports = Building
