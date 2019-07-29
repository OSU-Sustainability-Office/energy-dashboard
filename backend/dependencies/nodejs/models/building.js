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
      group: this.group
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
    let buildings = []
    let buildingRows = await DB.query('SELECT * FROM buildings')
    for (let buildingRow of buildingRows) {
      let building = new Building(buildingRow['id'])
      building.mapId = buildingRow['map_id']
      building.image = buildingRow['image']
      building.group = buildingRow['group']
      buildings.push(building)
    }
    return buildings
  }
}

module.exports = Building
