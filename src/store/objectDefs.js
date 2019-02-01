/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-31T11:31:52-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-31T13:56:02-08:00
 */
export class Story {
  constructor (name = '', id = null, description = '', publicStory = false, media = [], loaded = false, blocks = [], removed = []) {
    this.name = name
    this.id = id
    this.description = description
    this.public = publicStory
    this.media = media
    this.blocks = blocks
    this.loaded = false
    this.removed = removed
  }
}

export class Group {
  constructor (name = '', stories = [], publicGroup = false, id = null) {
    this.name = name
    this.stories = stories
    this.public = publicGroup
    this.id = id
  }
}

export class GroupStory {
  constructor (id = null, user_id = null, name = '', description = '', publicGroupStory = false, media = '', group_id = null) {
    this.id = id
    this.user_id = user_id
    this.name = name
    this.description = description
    this.public = publicGroupStory
    this.media = media
    this.group_id = group_id
  }
}

export class Block {
  constructor (id = null, index = null, name = '', date_start = '', date_end = '', graph_type = 1, date_interval = 15, interval_unit = 'minute', charts = [], loaded = false) {
    this.id = id
    this.index = index
    this.name = name
    this.date_start = date_start
    this.date_end = date_end
    this.graph_type = graph_type
    this.date_interval = date_interval
    this.interval_unit = interval_unit
    this.charts = charts
    this.loaded = false
  }
}

export class Chart {
  constructor (id = null, block_id = null, group_id = null, index = null, meters = [], point = 'accumulated_real', name = '', meter = 0, data = []) {
    this.id = id
    this.index = index
    this.block_id = block_id
    this.group_id = group_id
    this.meters = meters
    this.point = point
    this.name = name
    this.meter = meter
    this.data = data
  }
}

export class Meter {
  constructor (id = null, name = '', meterClass = null, negate = 0) {
    this.id = id
    this.name = name
    this.class = meterClass
    this.negate = negate
  }
}
