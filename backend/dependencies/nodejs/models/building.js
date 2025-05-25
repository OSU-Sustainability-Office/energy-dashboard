/* Filename: models/building.js
 * Description: Defines Building class and methods to interact with the database.
 */
import { connect, query as _query } from '/opt/nodejs/sql-access.js'
import MeterGroup from '/opt/nodejs/models/meter_group.js'
import Meter from '/opt/nodejs/models/meter.js'

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

  get data () {
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
      hidden: this.hidden,
      geoJSON: this.geoJSON
    }
  }

  static async updateGeoJSON (id, geoJSON) {
    await connect()
    await _query('UPDATE buildings SET geojson = ? WHERE id = ?', [JSON.stringify(geoJSON), id])
  }

  set (name, group, mapId, image, meterGroups, hidden, geoJSON) {
    this.name = name
    this.mapId = mapId
    this.image = image
    this.group = group
    this.meterGroups = meterGroups
    this.hidden = hidden
    this.geoJSON = geoJSON
  }

  static async all () {
    await connect()
    let queryJson = {}
    let query = await _query(
      `SELECT buildings.name,
              buildings.hidden, 
              buildings.id, 
              buildings.group, 
              buildings.map_id, 
              buildings.image, 
              buildings.geojson,
              meter_groups.id as meter_group_id,
              meter_groups.name as meter_group_name,
              meter_groups.default as meter_group_default,
              meters.name as meter_name,
              meters.id as meter_id,
              meters.class as meter_class,
              meters.pacific_power_id as pacific_power_id
        FROM buildings 
        LEFT JOIN meter_groups on buildings.id = meter_groups.building_id
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
          hidden: row.hidden === 1,
          geoJSON: row.geojson,
          meterGroups: {}
        }
      }

      if (!queryJson[row.id].meterGroups[row.meter_group_id]) {
        queryJson[row.id].meterGroups[row.meter_group_id] = {
          name: row.meter_group_name,
          default: row.meter_group_default === 1,
          meters: {}
        }
      }

      queryJson[row.id].meterGroups[row.meter_group_id].meters[row.meter_id] = {
        name: row.meter_name,
        classInt: row.meter_class,
        pacificPowerId: row.pacific_power_id
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
          meter.set(meterJson.name, meterJson.classInt, meterJson.pacificPowerId)
          meters.push(meter)
        }

        let groupJson = queryJson[key].meterGroups[groupKey]
        let group = new MeterGroup(groupKey)
        group.set(meters, groupJson.name, groupJson.default)
        metergroups.push(group)
      }
      let building = new Building(key)
      building.set(
        queryJson[key].name,
        queryJson[key].group,
        queryJson[key].mapId,
        queryJson[key].image,
        metergroups,
        queryJson[key].hidden,
        queryJson[key].geoJSON
      )
      buildings.push(building)
    }
    return buildings
  }
}

export default Building
