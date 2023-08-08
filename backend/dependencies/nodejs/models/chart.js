/*
 * @Author: Brogan
 * @Date:   Monday June 17th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday June 17th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require("/opt/nodejs/sql-access.js");
// const MeterGroup = require('/opt/nodejs/models/meter_group.js')
// const Building = require('/opt/nodejs/models/building.js')

class Chart {
  constructor(id) {
    if (!id) {
      throw new Error("Chart requires id");
    }
    this.id = id;
    this.meters = null;
    this.name = "";
    this.point = "";
    this.building = null;
  }

  async get() {
    await DB.connect();
    let chartRow = await DB.query("SELECT * FROM block_groups WHERE id = ?", [
      this.id,
    ]);
    this.name = chartRow[0]["name"];
    this.point = chartRow[0]["point"];
    this.meters = chartRow[0]["group_id"];
    // Leaving this here for now but it is not right (column does not exist in this table)
    this.building = chartRow[0]["building_id_2"];
    return this;
  }

  async update(name, point, meterGroup, building, user) {
    await DB.connect();
    let responseQuery;
    if (user.data.privilege > 3) {
      responseQuery = await DB.query(
        "UPDATE block_groups SET name = ?, point = ?, group_id = ? WHERE id = ?",
        [name, point, meterGroup, this.id],
      );
    } else {
      responseQuery = await DB.query(
        "UPDATE block_groups SET name = ?, point = ?, group_id = ? RIGHT JOIN (SELECT stories.user AS user, blocks.id as id FROM blocks RIGHT JOIN stories ON stories.id = blocks.story_id) AS q1 ON q1.id = block_groups.block_id WHERE q1.user = ? AND block_groups.id = ?",
        [name, point, meterGroup, user.data.onid, this.id],
      );
    }
    if (responseQuery["affectedRows"] === 0) {
      throw new Error("Could not update chart");
    }
    this.name = name;
    this.point = point;
    this.meters = meterGroup;
    this.building = building;
    return this;
  }

  async delete(user) {
    await DB.connect();
    let responseQuery;
    if (user.data.privilege > 3) {
      responseQuery = await DB.query("DELETE block_groups WHERE id = ?", [
        this.id,
      ]);
    } else {
      responseQuery = await DB.query(
        "DELETE block_groups RIGHT JOIN (SELECT stories.user AS user, blocks.id as id FROM blocks RIGHT JOIN stories ON stories.id = blocks.story_id) AS q1 ON q1.id = block_groups.block_id WHERE q1.user = ? AND block_groups.id = ?",
        [user.data.onid, this.id],
      );
    }
    if (responseQuery["affectedRows"] === 0) {
      throw new Error("Could not delete chart");
    }
  }

  static async create(name, point, meterGroup, building, blockId, user) {
    await DB.connect();
    let userCheck = await DB.query(
      "SELECT stories.user AS user FROM blocks RIGHT JOIN stories ON blocks.story_id = stories.id WHERE blocks.id = ?",
      [blockId],
    );
    if (userCheck[0]["user"] !== user.data.onid && user.data.privilege < 3) {
      throw new Error("Cant create a chart on that block for that user");
    }
    let insertRow = await DB.query(
      "INSERT INTO block_groups (name, point, group_id, block_id) VALUES (?, ?, ?, ?)",
      [name, point, meterGroup, blockId],
    );
    if (insertRow["affectedRows"] === 0) {
      throw new Error("Could not create chart");
    }
    let chart = new Chart(insertRow.insertId);
    chart.name = name;
    chart.meters = meterGroup;
    chart.building = building;
    return chart;
  }

  get data() {
    return {
      id: this.id,
      meters: this.meters,
      name: this.name,
      point: this.point,
      building: this.building,
    };
  }
}

module.exports = Chart;
