const express = require('express')
const router = express.Router()
const db = require('../db')
const fs = require('fs')
const mapData = require('./energydboardbuildings.json')

router.use(require('sanitize').middleware)

// Begin routes

// ROUTES FOR CHANGING DATA
router.post('/story', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('group_id')) {
      db.query('INSERT INTO stories (user_id, group_id, name, description) VALUES (?, ?, ?, ?)', [req.session.user.id, req.bodyInt('group_id'), req.bodyString('name'), req.bodyString('description')]).then(rows => {
        res.status(201).send(JSON.stringify({ id: rows.insertId }))
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO GROUP')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.put('/story', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('UPDATE stories SET name = ?, description = ?, media = ? WHERE id = ? AND user_id = ?', [req.bodyString('name'), req.bodyString('description'), req.bodyString('media'), req.bodyInt('id'), req.session.user.id]).then(() => {
        res.status(204).send()
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.delete('/story', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('DELETE FROM stories WHERE user_id = ? AND id = ?', [req.session.user.id, req.bodyInt('id')]).then(() => {
        res.status(204).send()
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})

router.get('/story', (req, res) => {
  if (req.queryInt('id')) {
    let promises = []
    const id = req.queryInt('id')
    promises.push(db.query('SELECT * FROM stories WHERE id=?', [id]))
    promises.push(db.query('SELECT * FROM blocks WHERE story_id=?', [id]))
    promises.push(db.query('SELECT block_groups.* FROM (SELECT id FROM blocks WHERE story_id=?) AS block LEFT JOIN block_groups ON block.id = block_groups.block_id', [id]))
    promises.push(db.query('SELECT meter_group_relation.*, chart.chart_id FROM (SELECT block_groups.group_id as id, block_groups.id AS chart_id FROM (SELECT id FROM blocks WHERE story_id=?) AS block LEFT JOIN block_groups ON block.id = block_groups.block_id) AS chart LEFT JOIN meter_group_relation ON meter_group_relation.group_id = chart.id', [id]))
    Promise.all(promises).then(r => {
      let rObj = r[0][0]
      rObj.blocks = r[1]
      // Fix for wrong timezone should not be for loop....
      for (let b of rObj.blocks) {
        let ds = new Date(b.date_start)
        ds.setTime(ds.getTime() - ds.getTimezoneOffset() * 60 * 1000)
        b.date_start = ds.toISOString()

        let de = new Date(b.date_end)
        de.setTime(de.getTime() - de.getTimezoneOffset() * 60 * 1000)
        b.date_end = de.toISOString()
      }
      rObj.openCharts = r[2]
      rObj.openMeters = r[3]
      res.send(JSON.stringify(rObj))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

router.post('/group', function (req, res) {
  if (req.session.user && req.session.user.id) {
    db.query('INSERT INTO story_groups (name, user_id) VALUES (?, ?)', [req.bodyString('name'), req.session.user.id]).then(rows => {
      res.status(201).send(JSON.stringify({ id: rows.insertId }))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.put('/group', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('UPDATE story_groups SET name = ? WHERE id = ? AND user_id = ?', [req.bodyString('name'), req.bodyInt('id'), req.session.user.id]).then(() => {
        res.status(204).send()
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.delete('/group', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('DELETE FROM story_groups WHERE user_id = ? AND id = ?', [req.session.user.id, req.bodyInt('id')]).then(() => {
        res.status(204).send()
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})

router.post('/block', function (req, res) {
  if (req.session.user && req.session.user.id) {
    db.query('INSERT INTO blocks (date_start, date_end, graph_type, story_id, name, date_interval, interval_unit) VALUES (?, ?, ?, (SELECT id FROM stories WHERE user_id = ? AND id = ?), ?, ?, ?)', [req.bodyString('date_start'), req.bodyString('date_end'), req.bodyInt('graph_type'), req.session.user.id, req.bodyInt('story_id'), req.bodyString('name'), req.bodyInt('date_interval'), req.bodyString('interval_unit')]).then(rows => {
      res.status(201).send(JSON.stringify({ id: rows.insertId }))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.put('/block', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('UPDATE blocks INNER JOIN stories on blocks.story_id = stories.id SET blocks.name = ?, blocks.date_start = ?, blocks.date_end = ?, blocks.graph_type = ?, blocks.date_interval = ?, blocks.interval_unit = ? WHERE blocks.id = ? AND stories.user_id = ?', [req.bodyString('name'), req.bodyString('date_start'), req.bodyString('date_end'), req.bodyInt('graph_type'), req.bodyInt('date_interval'), req.bodyString('interval_unit'), req.bodyInt('id'), req.session.user.id]).then(() => {
        res.status(204).send()
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.delete('/block', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('DELETE blocks FROM blocks INNER JOIN stories ON blocks.story_id = stories.id WHERE stories.user_id = ? AND blocks.id = ?', [req.session.user.id, req.bodyInt('id')]).then(() => {
        res.status(204).send()
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})

router.post('/chart', function (req, res) {
  if (req.session.user && req.session.user.id) {
    db.query('INSERT INTO block_groups (block_id, group_id, name, point, meter) VALUES ((SELECT blocks.id FROM stories INNER JOIN blocks ON blocks.story_id = stories.id WHERE stories.user_id = ? AND blocks.id = ?), ?, ?, ?, ?)', [req.session.user.id, req.bodyInt('block_id'), req.bodyInt('group_id'), req.bodyString('name'), req.bodyString('point'), req.bodyInt('meter')]).then(rows => {
      res.status(201).send(JSON.stringify({ id: rows.insertId }))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.put('/chart', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('UPDATE block_groups INNER JOIN (SELECT stories.user_id, blocks.id FROM stories INNER JOIN blocks ON blocks.story_id = stories.id) AS blocks ON blocks.id = block_groups.block_id SET block_groups.group_id = ?, block_groups.name = ?, block_groups.point = ?, block_groups.meter = ? WHERE block_groups.id = ? AND blocks.user_id = ?', [req.bodyInt('group_id'), req.bodyString('name'), req.bodyString('point'), req.bodyInt('meter'), req.bodyInt('id'), req.session.user.id]).then(() => {
        res.status(204).send()
      }).catch(e => {
        res.status(400).send('400: ' + e.message)
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})
router.delete('/chart', function (req, res) {
  if (req.session.user && req.session.user.id) {
    if (req.bodyInt('id')) {
      db.query('DELETE block_groups FROM block_groups INNER JOIN (SELECT stories.user_id, blocks.id FROM stories INNER JOIN blocks ON blocks.story_id = stories.id) AS blocks ON blocks.id = block_groups.block_id WHERE block_groups.id = ? AND blocks.user_id = ?', [req.bodyInt('id'), req.session.user.id]).then(() => {
        res.status(204).send()
      })
    } else {
      res.status(400).send('400: NO ID')
    }
  } else {
    res.status(403).send('403: NOT AUTHORIZED')
  }
})

// Current user info
router.get('/user', function (req, res) {
  if (req.session.user) {
    res.send(JSON.stringify({ name: req.session.user.name, privilege: req.session.user.privilige, id: req.session.user.id }))
  } else {
    res.send(JSON.stringify({ name: '', privilige: 0, id: null }))
    console.log('hd')
  }
})

// Map Functions
router.get('/map', function (req, res) {
  res.send(mapData)
})

// BUILDINGS
router.get('/buildings', function (req, res) {
  db.query('SELECT id, name FROM meter_groups WHERE is_building=1').then(rows => {
    res.send(rows)
  }).catch(err => {
    res.status(400).send('400: ' + err.message)
  })
})

// STORIES
router.get('/stories', (req, res) => {
  let query = 'SELECT stories.id AS id, stories.name AS name, stories.description AS description, stories.public AS public, stories.media AS media, stories.group_id AS group_id, story_groups.name AS group_name, story_groups.public AS group_public FROM stories JOIN story_groups ON stories.group_id = story_groups.id WHERE stories.public = 1'
  if (req.session.user) {
    query = 'SELECT stories.id AS id, stories.name AS name, stories.description AS description, stories.public AS public, stories.media AS media, stories.group_id AS group_id, story_groups.name AS group_name, story_groups.public AS group_public FROM stories JOIN story_groups ON stories.group_id = story_groups.id WHERE stories.public = 1 OR stories.user_id = ' + req.session.user.id
  }
  db.query(query).then(rows => {
    res.status(200).send(JSON.stringify(rows))
  }).catch(e => {
    res.status(400).send('400: ' + e.message)
  })
})

router.get('/data', (req, res) => {
  if (req.queryString('startDate') && req.queryString('endDate') && req.queryInt('id') && req.queryString('point')) {
    console.log(req.queryString('startDate'))
    let q = 'SELECT time, ' + req.queryString('point') + ' FROM data WHERE time >= ? AND time <= ? AND meter_id = ?'
    db.query(q, [req.queryString('startDate'), req.queryString('endDate'), req.queryInt('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(400).send('400: BAD PARAMS')
  }
})

router.get('/meters', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT meters.id AS meter_id, meters.name, meters.type, meter_group_relation.operation, meter_group_relation.group_id FROM meters LEFT JOIN meter_group_relation ON meters.id=meter_group_relation.meter_id WHERE group_id=?', [req.queryString('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

// Photos
router.get('/media', function (req, res) {
  fs.readdir('./block-media', (e, files) => {
    if (!e) {
      res.send(JSON.stringify(files.filter(file => {
        return file.toLowerCase().indexOf('.png') !== -1 || file.toLowerCase().indexOf('.jpg') !== -1
      })))
    } else { res.status(400).send('400: ' + e.message) }
  })
})

module.exports = () => { return router }
