/*
 * @Author: Brogan
 * @Date:   Wednesday September 25th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Wednesday September 25th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const DDB = require('/opt/nodejs/dynamo-access.js')
// const DB = require('/opt/nodejs/sql-access.js')
const Story = require('/opt/nodejs/models/story.js')
const Alert = require('/opt/nodejs/models/alert.js')

class User {
  constructor(onid) {
    this.onid = onid
    this.views = []
    this.alerts = []
  }

  async get() {
    if (this.onid === '') return this
    // await DB.connect()
    // let userRow = await DB.query('SELECT * FROM users WHERE name = ?', [this.onid])
    // if (userRow.length === 1) {
    // this.privilege = userRow[0].privilege
    this.views = await Story.storiesForUser(this.onid)
    this.alerts = await Alert.alertsForUser(this.onid)
    // }
    return this
  }

  static async all(user) {
    if (user.privilege > 3) {
      DDB.initialize()
      let users = (await DDB.query('lambda-users').scan({})).Items
      return users
    }
    return ''
  }

  get data() {
    return {
      views: this.views.map(o => o.data),
      alerts: this.alerts.map(o => o.data)
    }
  }
}

module.exports = User
