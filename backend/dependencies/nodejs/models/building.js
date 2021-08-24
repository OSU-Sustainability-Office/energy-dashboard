/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const MeterGroup = require('/opt/nodejs/models/meter_group.js')
const Meter = require('/opt/nodejs/models/meter.js')
// const axios = require('axios')
// const Geo = require('osmtogeojson')
// const XMLDom = require('xmldom')

class Building {
  constructor (id) {
    this.id = id
    this.mapId = ''
    this.image = ''
    this.meterGroups = []
    this.group = ''
    this.geoJSON = ''
    this.name = ''
    this.hidden = false
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
      name: this.name,
      hidden: this.hidden
    }
  }

  async update (name, mapId, image, group, meters, user) {
    await DB.connect()
    let keepList = []
    if (user.data.privilege > 3) {
      await DB.query('UPDATE buildings SET map_id = ?, image = ?, `group` = ?, name = ? WHERE id = ?', [mapId, image, group, name, this.id])
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
    this.name = name
    this.mapId = mapId
    this.image = image
    this.group = group
    this.meterGroups = keepList
    return this
  }

  async delete (user) {
    await DB.connect()
    if (user.data.privilege > 3) {
      await DB.query('DELETE FROM buildings WHERE id = ?', [this.id])
    } else {
      throw new Error('Need escalated permissions')
    }
  }

  static async create (name, mapId, image, group, meters, user) {
    if (user.data.privilege <= 3) {
      throw new Error('Need escalated permissions')
    }
    await DB.connect()
    let buildingRow = await DB.query('INSERT INTO buildings (map_id, image, `group`, name) VALUES (?, ?, ?, ?)', [mapId, image, group, name])
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
    building.name = name
    building.mapId = mapId
    building.image = image
    building.group = group
    building.meterGroups = meterList
    return building
  }

  set (name, group, mapId, image, meterGroups, hidden) {
    this.name = name
    this.mapId = mapId
    this.image = image
    this.group = group
    this.meterGroups = meterGroups
    this.hidden = hidden
  }

  static async all () {
    await DB.connect()
    let queryJson = {}
    let query = await DB.query(
      `SELECT buildings.name,
              buildings.hidden, 
              buildings.id, 
              buildings.group, 
              buildings.map_id, 
              buildings.image, 
              meter_groups.id as meter_group_id,
              meter_groups.name as meter_group_name,
              meter_groups.default as meter_group_default,
              meters.name as meter_name,
              meters.id as meter_id,
              meters.class as meter_class,
              meter_group_relation.operation as meter_negate
        FROM buildings 
        LEFT JOIN meter_groups on buildings.id = meter_groups.building_id_2
        LEFT JOIN meter_group_relation on meter_groups.id = meter_group_relation.group_id
        LEFT JOIN meters on meters.id = meter_group_relation.meter_id;`
    )
    /*
      Should probably change this to not be converted to json then models but
      directly to models.
    */
    for (let row of query) {
      if (!queryJson[row.id]) {
        queryJson[row.id] = {
          name: row.name,
          group: row.group,
          mapId: row.map_id,
          image: row.image,
          hidden: (row.hidden === 1),
          meterGroups: {}
        }
      }

      if (!queryJson[row.id].meterGroups[row.meter_group_id]) {
        queryJson[row.id].meterGroups[row.meter_group_id] = {
          name: row.meter_group_name,
          default: (row.meter_group_default === 1),
          meters: {}
        }
      }

      queryJson[row.id].meterGroups[row.meter_group_id].meters[row.meter_id] = {
        name: row.meter_name,
        classInt: row.meter_class,
        negate: (row.meter_negate === 0)
      }
    }

    let buildings = []
    for (let key of Object.keys(queryJson)) {
      let metergroups = []
      for (let groupKey of Object.keys(queryJson[key].meterGroups)) {
        let meters = []
        for (let meterKey of Object.keys(queryJson[key].meterGroups[groupKey].meters)) {
          let meterJson = queryJson[key].meterGroups[groupKey].meters[meterKey]
          let meter = new Meter(meterKey)
          meter.set(meterJson.name, meterJson.classInt, meterJson.negate)
          meters.push(meter)
        }

        let groupJson = queryJson[key].meterGroups[groupKey]
        let group = new MeterGroup(groupKey)
        group.set(meters, groupJson.name, groupJson.default)
        metergroups.push(group)
      }
      let building = new Building(key)
      building.set(queryJson[key].name, queryJson[key].group, queryJson[key].mapId, queryJson[key].image, metergroups, queryJson[key].hidden)
      buildings.push(building)
    }
    return buildings
  }
}

module.exports = Building
