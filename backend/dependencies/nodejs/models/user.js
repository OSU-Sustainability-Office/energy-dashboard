/*
 * @Author: Brogan
 * @Date:   Wednesday September 25th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Wednesday September 25th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const Story = require('/opt/nodejs/models/story.js')
const Alert = require('/opt/nodejs/models/alert.js')

class User {
  constructor (onid) {
    this.onid = onid
    this.privilege = 0
    this.stories = []
    this.alerts = []
  }

  async get () {
    if (this.onid === '') return this
    await DB.connect()
    let userRow = await DB.query('SELECT * FROM users WHERE name = ?', [this.onid])
    if (userRow.length === 1) {
      this.privilege = userRow[0].privilege
      this.stories = await Story.storiesForUser(userRow[0].id)
      this.alerts = await Alert.alertsForUser(userRow[0].id)
    }
    return this
  }

  get
  data () {
    return {
      onid: this.onid,
      privilege: this.privilege,
      stories: this.stories,
      alerts: this.alerts
    }
  }
}

module.exports = User
