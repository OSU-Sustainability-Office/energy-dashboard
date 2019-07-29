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
    this.user = storyRow[0]['user']
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

  async update (name, media, user) {
    await DB.connect()
    let queryResponse
    if (user.data.privilege > 3) {
      queryResponse = await DB.query('DELETE stories WHERE id = ?', [this.id])
    } else {
      queryResponse = await DB.query('UPDATE stories SET name = ?, media = ? WHERE id = ? AND user = ?', [name, media, this.id, user.data.onid])
    }
    if (queryResponse['affectedRows'] === 0) {
      throw new Error('Story not found')
    }
    this.name = name
    this.media = media
    return this
  }

  get
  data () {
    let blocks = this.blocks
    if (blocks.length > 0 && blocks[0] instanceof Block) {
      blocks = blocks.map(o => o.data)
    }
    return {
      id: this.id,
      name: this.name,
      media: this.media,
      blocks: blocks,
      user: this.user
    }
  }

  async delete (user) {
    await DB.connect()
    let queryResponse
    if (user.data.privilege > 3) {
      queryResponse = await DB.query('DELETE stories WHERE id = ?', [this.id])
    } else {
      queryResponse = await DB.query('DELETE stories WHERE id = ? AND user = ?', [this.id, user.data.onid])
    }
    if (queryResponse['affectedRows'] === 0) {
      throw new Error('Story not found')
    }
  }

  static async create (name, media, user) {
    await DB.connect()
    let insertRow = DB.query('INSERT INTO stories (name, media, user) VALUES (?, ?, ?)', [name, media, user.data.onid])
    let story = Story(insertRow[0]['insert_id'])
    story.name = name
    story.media = media
    story.user = user
    return story
  }

  static async storiesForUser (user) {
    await DB.connect()
    let storyRows = await DB.connect('SELECT * FROM stories WHERE user = ?', user.data.onid)
    let stories = []
    for (let row of storyRows) {
      let story = new Story(row['id'])
      story.name = row['name']
      story.media = row['media']
      story.user = row['user']
    }
    return stories
  }
}

module.exports = Story
