/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const MeterGroup = require('/opt/nodejs/models/meter_group.js')

class Building {
  constructor (id) {
    this.id = id
    this.mapId = ''
    this.image = ''
    this.meterGroups = []
    this.group = ''
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
        this.meterGroups.push(MeterGroup(row['id']).get())
      }
      await Promise.all(this.meterGroups)
    } else {
      for (let row of meterGroupRows) {
        this.meterGroups.push(row['id'])
      }
    }
    return this
  }

  async update (mapId, image, group) {
    await DB.connect()
    await DB.query('UPDATE buildings SET map_id = ?, image = ?, group = ? WHERE id = ?', [mapId, image, group, this.id])
    this.mapId = mapId
    this.image = image
    this.group = group
    return this
  }

  async delete (user) {
    if (user.privilege > 3) {
      await DB.query('DELETE buildings WHERE id = ?', [this.id])
    }
  }

  static async create (mapId, image, group) {
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
    let buildings = []
    let buildingRows = DB.query('SELECT * FROM buildings')
    for (let buildingRow of buildingRows) {
      let building = Building(buildingRow['id'])
      building.mapId = buildingRow['map_id']
      building.image = buildingRow['image']
      building.group = buildingRow['group']
      buildings.push(building)
    }
    return buildings
  }
}

exports = Building
