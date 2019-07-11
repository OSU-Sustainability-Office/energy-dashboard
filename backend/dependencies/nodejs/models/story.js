/*
 * @Author: Brogan
 * @Date:   Saturday June 15th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday June 15th 2019
 * @Copyright:  Oregon State University 2019
 */

const DB = require('/opt/nodejs/sql-access.js')
const Block = require('/opt/nodejs/models/block.js')

class Story {
  constructor (id) {
    this.id = id
    this.name = ''
    this.blocks = []
    this.media = ''
    this.user = ''
  }

  async get (expand = true) {
    await DB.connect()
    let storyRow = await DB.query('SELECT * FROM stories WHERE id = ?', [this.id])
    this.name = storyRow[0]['name']
    this.media = storyRow[0]['media']
    let blockRows = await DB.query('SELECT * FROM blocks WHERE story_id = ?', [this.id])
    if (expand) {
      for (let row of blockRows) {
        this.blocks.push(Block(row['id']).get())
      }
      await this.blocks
    } else {
      this.blocks = blockRows.map(row => row['id'])
    }
    return this
  }

  async update (name, media) {
    await DB.connect()
    await DB.query('UPDATE stories SET name = ?, media = ? WHERE id = ?', [name, media, this.id])
    this.name = name
    this.media = media
    return this
  }

  async delete (user) {
    if (user.onid === this.user || user.privilege > 3) {
      await DB.query('DELETE stories WHERE id = ?', [this.id])
    }
  }

  static async create (name, media, user) {
    await DB.connect()
    let insertRow = DB.query('INSERT INTO stories (name, media, user) VALUES (?, ?, ?)', [name, media, user])
    let story = Story(insertRow[0]['insert_id'])
    story.name = name
    story.media = media
    story.user = user
    return story
  }
}

exports = Story
