/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const axios = require('axios')
const Geo = require('osmtogeojson')
const XMLDom = require('xmldom')

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
    if (buildingRow.length <= 0) return this
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

  async update (mapId, image, group, meters, user) {
    await DB.connect()
    let keepList = []
    if (user.data.privilege > 3) {
      await DB.query('UPDATE buildings SET map_id = ?, image = ?, `group` = ? WHERE id = ?', [mapId, image, group, this.id])
      let first = true
      for (let meter of meters) {
        let mg
        try {
          mg = await (new MeterGroup(meter.id)).get()
          mg.update(
            meter.name,
            meter.meters,
            first,
            user
          )
        } catch (e) {
          mg = await MeterGroup.create(
            meter.name,
            meter.meters,
            first,
            this.id,
            user
          )
        }
        first = false
        keepList.push(mg.id)
      }

      await MeterGroup.deleteBuildingGroups(this.id, keepList, user)
    } else {
      throw new Error('Need escalated permissions')
    }
    this.mapId = mapId
    this.image = image
    this.group = group
    this.meterGroups = keepList
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

  static async create (mapId, image, group, meters, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    let buildingRow = await DB.query('INSERT INTO buildings (map_id, image, `group`) VALUES (?, ?, ?)', [mapId, image, group])
    let meterList = []
    let first = true
    for (let meter of meters) {
      let id = (await MeterGroup.create(
        meter.name,
        meter.meters,
        first,
        buildingRow['insertId'],
        user
      )).id
      first = false
      meterList.push(id)
    }
    let building = new Building(buildingRow['insertId'])
    building.mapId = mapId
    building.image = image
    building.group = group
    building.meterGroups = meterList
    return building
  }

  static async all () {
    await DB.connect()
    let buildings = {}
    let promiseChain1 = await Promise.all([DB.query('SELECT buildings.id, buildings.group, buildings.map_id, buildings.image, meter_groups.id as meter_group_id FROM buildings LEFT JOIN meter_groups on buildings.id = meter_groups.building_id_2')])
    const buildingRows = promiseChain1[0]
    // const token = promiseChain1[1]
    const promiseChain2 = []
    for (let buildingRow of buildingRows) {
      if (buildings[buildingRow['id']]) {
        buildings[buildingRow['id']].meterGroups.push(buildingRow['meter_group_id'])
      } else {
        let building = new Building(buildingRow['id'])
        building.mapId = buildingRow['map_id']
        building.group = buildingRow['group']
        building.meterGroups = [buildingRow['meter_group_id']]
        promiseChain2.push(axios('https://api.openstreetmap.org/api/0.6/way/' + buildingRow['map_id'] + '/full', { method: 'get' }).then(data => {
          let xmlData = (new XMLDom.DOMParser()).parseFromString(data.data)
          building.geoJSON = Geo(xmlData).features[0]
          building.name = building.geoJSON.properties.name
          building.image = buildingRow['image']
          building.geoJSON.properties.id = building.id
          building.geoJSON.properties.group = buildingRow['group']
        }))
        buildings[buildingRow['id']] = building
      }
    }
    await Promise.all(promiseChain2)
    return Object.values(buildings)
  }
}

module.exports = Building
