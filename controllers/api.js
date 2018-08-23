const express = require('express')
const router = express.Router()
const db = require('../db')
let cas = null
const fs = require('fs')
const mapData = require('./energydboardbuildings.json')

router.use(require('sanitize').middleware)

// Begin routes
// Current user info
router.get('/currentUser', function (req, res) {
  res.send(req.session[cas.session_name])
})

router.get('/currentUserID', function (req, res) {
  res.send(req.session.id)
})

// High privilige
router.get('/getAllUsers', function (req, res) {
  if (req.sesion.user.privilege <= 2) {
    res.status(403).send('403: NON PRIVILIGED USER')
  } else {
    db.query('SELECT * FROM users').then(rows => {
      res.send(rows)
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  }
})

router.get('/getAllMeterGroups', function (req, res) {
  if (req.sesion.user.privilege <= 2) {
    res.status(403).send('403: NON PRIVILIGED USER')
  } else {
    db.query('SELECT * FROM meter_groups').then(rows => {
      res.send(rows)
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  }
})

// router.delete('/deleteMeterGroup')

// Map Functions
router.get('/getBuildingsForMap', function (req, res) {
  res.send(mapData)
})

// BUILDINGS
router.get('/getAllBuildings', function (req, res) {
  db.query('SELECT id, name FROM meter_groups WHERE is_building=1').then(rows => {
    res.send(rows)
  }).catch(err => {
    res.status(400).send('400: ' + err.message)
  })
})

// BLOCKS
router.get('/getBlock', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT * FROM blocks WHERE id=?', [req.queryString('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

router.get('/getBlockMeterGroups', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT * FROM block_groups WHERE block_id=?', [req.queryString('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

router.get('/getBlockDataForStory', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT * FROM blocks WHERE story_id=?', [req.queryString('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

router.post('/deleteBlock', function (req, res) {
  if (req.bodyInt('id')) {
    db.query('SELECT stories.user_id, blocks.id FROM blocks LEFT JOIN stories ON blocks.story_id = stories.id WHERE blocks.id = ?', [req.bodyInt('id')]).then(rows => {
      if (rows[0].user_id === req.session.user.id) {
        db.query('DELETE FROM block_groups WHERE block_id=?', [req.bodyInt('id')]).then(val => {
          db.query('DELETE FROM blocks WHERE id=?', [req.bodyInt('id')]).then(val => {
            res.send('DELETED BLOCK')
          }).catch(err => {
            throw err
          })
        }).catch(err => {
          throw err
        })
      } else { throw new Error('NOT LOGGED IN') }
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(401).send('401: NOT AUTHORIZED')
  }
})

router.post('/updateBlock', function (req, res) {
  // update
  if (req.bodyInt('id')) {
    let promises = []
    db.query('SELECT stories.user_id, blocks.id FROM blocks LEFT JOIN stories ON blocks.story_id = stories.id WHERE blocks.id = ?', [req.bodyInt('id')]).then(rows => {
      if (rows[0].user_id === req.session.user.id) {
        if (req.bodyJson().meter_groups.length > 0) {
          db.query('DELETE FROM block_groups WHERE block_id=?', [req.bodyInt('id')]).then(rows => {
            for (let meterGroup of req.bodyJson().meter_groups) {
              promises.push(db.query('INSERT INTO block_groups (block_id, group_id, point, name, meter) VALUES (?,?,?,?,?)', [req.bodyInt('id'), meterGroup.id, meterGroup.point, meterGroup.name, meterGroup.meter]))
            }
          }).catch(err => {
            throw err
          })
        }
        let queryString = 'UPDATE blocks SET '
        if (req.bodyString('date_end')) {
          queryString += 'date_end="' + req.bodyString('date_end') + '", '
        }
        if (req.bodyString('date_start')) {
          queryString += 'date_start="' + req.bodyString('date_start') + '", '
        }
        if (req.bodyString('date_range')) {
          queryString += 'date_range="' + req.bodyString('date_range') + '", '
        }
        if (req.bodyInt('graph_type')) {
          queryString += 'graph_type="' + req.bodyInt('graph_type') + '", '
        }
        if (req.bodyString('media')) {
          queryString += 'media="' + req.bodyString('media') + '", '
        }
        if (req.bodyString('descr')) {
          queryString += 'descr="' + req.bodyString('descr') + '", '
        }
        if (req.bodyString('name')) {
          queryString += 'name="' + req.bodyString('name') + '", '
        }
        if (req.bodyString('interval')) {
          queryString += 'date_interval=' + req.bodyInt('interval') + ', '
        }
        if (req.bodyString('unit')) {
          queryString += 'interval_unit="' + req.bodyString('unit') + '", '
        }
        queryString = queryString.substr(0, queryString.length - 2)
        queryString += ' WHERE id=' + req.bodyInt('id')
        promises.push(db.query(queryString))
        Promise.all(promises).then(() => {
          res.status(200).send('200: UPDATED BLOCK')
        }).catch(err => {
          res.status(400).send('400: ' + err.message)
        })
      } else {
        res.status(401).send('401: NOT AUTHORIZED')
      }
    }).catch(err => {
      console.log(err)
      res.status(400).send('400: ' + err.message)
    })
  } else if (req.bodyInt('story_id')) { // create
    let promises = []
    db.query('SELECT * FROM stories where id=?', [req.bodyInt('story_id')]).then(val => {
      if (val === null || val[0].user_id !== req.session.user.id) {
        res.status(400).send('400: BAD STORY ID')
      } else {
        let queryString = 'INSERT INTO blocks (story_id'
        let valuesString = '(' + req.bodyInt('story_id')
        if (req.bodyString('date_start')) {
          queryString += ',date_start'
          valuesString += ",'" + req.bodyString('date_start') + "'"
        }
        if (req.bodyString('date_end')) {
          queryString += ',date_end'
          valuesString += ",'" + req.bodyString('date_end') + "'"
        }
        if (req.bodyString('date_range')) {
          queryString += ',date_range'
          valuesString += ",'" + req.bodyString('date_range') + "'"
        }
        if (req.bodyInt('graph_type')) {
          queryString += ',graph_type'
          valuesString += ',' + req.bodyInt('graph_type')
        }
        if (req.bodyString('media')) {
          queryString += ',media'
          valuesString += ",'" + req.bodyString('media') + "'"
        }
        if (req.bodyString('descr')) {
          queryString += ',descr'
          valuesString += ",'" + req.bodyString('descr') + "'"
        }
        if (req.bodyString('name')) {
          queryString += ',name'
          valuesString += ",'" + req.bodyString('name') + "'"
        }

        db.query(queryString + ') VALUES ' + valuesString + ')').then(rows => {
          for (let meterGroup of req.bodyJson().meter_groups) {
            promises.push(db.query('INSERT INTO block_groups (block_id, group_id, point, name) VALUES (?,?,?,?)', [rows.insertId, meterGroup.id, meterGroup.point, meterGroup.name]))
          }
          Promise.all(promises).then(() => {
            res.status(201).send(JSON.stringify(rows.insertId))
          }).catch(err => {
            res.status(400).send('400: ' + err.message)
          })
        })
      }
    })
  }
})

// GROUPS
router.get('/getPublicGroups', function (req, res) {
  db.query('SELECT id, name FROM story_groups').then(r => {
    res.send(JSON.stringify(r))
  }).catch(e => {
    res.status(400).send('400: ' + e.message)
  })
})

router.get('/getGroupData', function (req, res) {
  let promises = []
  promises.push(db.query('SELECT name,id FROM story_groups WHERE id=?', [req.queryInt('id')]))
  promises.push(db.query('SELECT stories.name AS name, stories.media AS media, stories.description AS description, stories.id AS id FROM story_group_relation JOIN stories ON stories.id = story_group_relation.story_id WHERE story_group_relation.story_group_id=?', [req.queryInt('id')]))
  Promise.all(promises).then(r => { res.send(JSON.stringify(r)) }).catch(e => { res.status(400).send('400: ' + e.message) })
})

// STORIES
router.get('/stories', (req, res) => {
  let query = 'SELECT stories.id AS id, stories.name AS name, stories.description AS description, stories.public AS public, stories.media AS media, stories.group_id AS group_id, story_groups.name AS group_name, story_groups.public AS group_public FROM stories JOIN story_groups ON stories.group_id = story_groups.id WHERE stories.public = 1'
  if (req.session.user) {
    query = 'SELECT stories.id AS id, stories.name AS name, stories.description AS description, stories.public AS public, stories.media AS media, stories.group_id AS group_id story_groups.name AS group_name, story_groups.public AS group_public FROM stories JOIN story_groups ON stories.group_id = story_groups.id WHERE stories.public = 1 OR stories.user_id = ' + req.session.user.id
  }
  db.query(query).then(rows => {
    res.status(200).send(JSON.stringify(rows))
  }).catch(e => {
    res.status(400).send('400: ' + e.message)
  })
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

router.get('/getStoryGroup', function (req, res) {
  if (req.queryInt('id')) {
    db.query('SELECT relation.name AS group_name, stories.name AS story_name, stories.id AS story_id FROM (SELECT story_groups.name AS name, story_group_relation.story_id AS story_id, story_groups.id AS group_id FROM story_groups RIGHT JOIN story_group_relation ON story_group_relation.story_group_id = story_groups.id) AS relation JOIN stories ON stories.id = relation.story_id WHERE relation.group_id IN (SELECT story_groups.id FROM story_groups RIGHT JOIN story_group_relation ON story_groups.id = story_group_relation.story_group_id WHERE story_group_relation.story_id = ?)', [req.queryInt('id')]).then(val => {
      res.send(JSON.stringify(val))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

router.post('/changeFeaturedStory', function (req, res) {
  if (req.bodyInt('id') && req.session.user.id) {
    db.query('SELECT * FROM stories WHERE user_id=?', [req.session.user.id]).then(rows => {
      let promises = []
      rows.forEach(r => {
        if (r.id === req.bodyInt('id')) {
          promises.push(db.query('UPDATE stories SET featured=1 WHERE id=?', [r.id]))
        } else {
          promises.push(db.query('UPDATE stories SET featured=0 WHERE id=?', [r.id]))
        }
      })
      Promise.all(promises).then(() => {
        res.send('200: UPDATED FEATURED STORY')
      }).catch(e => {
        throw e
      })
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(400).send('400: NO ID SPECIFIED')
  }
})

router.get('/getStoryData', function (req, res) {
  // get a story by its id
  if (req.queryInt('id')) {
    db.query('SELECT * FROM stories WHERE id=?', [req.queryInt('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    })
  } else {
    res.send('ERROR: ID NOT SPECIFIED')
  }
})

router.get('/getBlocksForStory', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT * FROM blocks WHERE story_id=?', [req.queryString('id')]).then(rows => {
      rows.forEach(val => {
        val.date_start.setTime(val.date_start.getTime() - val.date_start.getTimezoneOffset() * 60 * 1000)
        val.date_end.setTime(val.date_end.getTime() - val.date_end.getTimezoneOffset() * 60 * 1000)
      })
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.send('ERROR: COULD NOT RETRIEVE BLOCKS')
  }
})

router.get('/getStoriesForCurrentUser', function (req, res) {
  if (req.session.user.id) {
    db.query('SELECT * FROM stories WHERE user_id=?', req.session.user.id).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(400).send('400: NOT LOGGED IN')
  }
})

router.get('/getPublicStories', function (req, res) {
  db.query('SELECT * FROM stories WHERE public=1').then(rows => {
    res.send(JSON.stringify(rows))
  }).catch(err => {
    res.status(400).send('400: ' + err.message)
  })
})

router.post('/deleteStory', function (req, res) {
  db.query('SELECT user_id FROM stories WHERE id=?', [req.bodyInt('id')]).then(rows => {
    if (rows[0].user_id === req.session.user.id) {
      db.query('DELETE block_groups FROM block_groups JOIN blocks ON blocks.id=block_groups.block_id WHERE blocks.story_id = ?', [req.bodyInt('id')]).then(val => {
        db.query('DELETE FROM blocks WHERE story_id=?', [req.bodyInt('id')]).then(v => {
          db.query('DELETE FROM stories WHERE id=?', [req.bodyInt('id')]).then(va => {
            res.send('200: DELETED STORY')
          }).catch(err => {
            throw err
          })
        }).catch(err => {
          throw err
        })
      }).catch(err => {
        throw err
      })
    } else {
      throw new Error('WRONG USER')
    }
  }).catch(err => {
    res.status(400).send('400: ' + err)
  })
})

router.post('/updateStory', function (req, res) {
  if (req.bodyInt('id')) {
    db.query('SELECT user_id FROM stories where id=?', [req.bodyInt('id')]).then(val => {
      if (val[0].user_id === req.session.user.id) {
        var queryString = 'UPDATE stories SET '
        if (req.bodyString('name')) {
          queryString += 'name="' + req.bodyString('name') + '", '
        }
        if (req.bodyString('descr')) {
          queryString += 'description="' + req.bodyString('descr') + '", '
        }
        if (req.bodyString('media')) {
          queryString += 'media="' + req.bodyString('media') + '", '
        }
        if (req.bodyInt('public') && req.session.user.privilige >= 3) {
          queryString += 'public=' + req.bodyInt('public') + ', '
        }
        queryString = queryString.substr(0, queryString.length - 2)
        queryString += 'WHERE id=' + req.bodyInt('id')
        db.query(queryString).then(rows => {
          res.status(200).send('200: UPDATED STORY')
        }).catch(err => {
          res.status(400).send('400: ' + err)
        })
      } else {
        res.status(401).send('401: INVALID USER')
      }
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else if (req.bodyString('name')) {
    let queryString = 'INSERT INTO stories (user_id, name,'
    let answers = [req.session.user.id, req.bodyString('name')]
    if (req.bodyString('descr')) {
      queryString += 'description,'
      answers.push(req.bodyString('descr'))
    }
    if (req.bodyInt('public') && req.session.user.privilige >= 3) {
      queryString += 'public,'
      answers.push(req.bodyInt('public'))
    }
    queryString = queryString.substr(0, queryString.length - 1)
    queryString += ') VALUES ('
    for (var a = 0; a < answers.length; a++) {
      queryString += '?'
      if (a !== answers.length - 1) { queryString += ',' }
    }
    queryString += ')'
    db.query(queryString, answers).then(rows => {
      res.status(201).send(JSON.stringify(rows.insertId))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  }
})

// METERS
router.get('/getDefaultMeters', function (req, res) {
  db.query('SELECT * FROM meters').then(rows => {
    res.send(JSON.stringify(rows))
  }).catch(err => {
    res.status.send('400: ' + err.message)
  })
})
router.get('/getMeterType', function (req, res) {
  if (req.queryInt('id')) {
    db.query('SELECT type FROM meters WHERE id=?', [req.queryInt('id')]).then(r => {
      res.send(JSON.stringify(r))
    }).catch(e => {
      res.status(400).send('400: ' + e.message)
    })
  } else {
    res.status(400).send('400: NO METER ID')
  }
})

router.get('/data', (req, res) => {
  if (req.queryString('startDate') && req.queryString('endDate') && req.queryInt('id') && req.queryString('point')) {
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

router.get('/getMeterData', function (req, res) {
  if (req.queryString('date_end') && req.queryString('date_start') && req.queryInt('id') && req.queryString('mpoints')) {
    db.query('SELECT type FROM meters WHERE id=?', [req.queryInt('id')]).then(r => {
      let table = 'data'
      if (r[0].type === 'e') {
        table = 'data'
      } else if (r[0].type === 'g') {
        table = 'gas_data'
      } else if (r[0].type === 's') {
        table = 'steam_data'
      }
      let queryString = 'SELECT time, meter_id, '
      req.queryString('mpoints').split(',').forEach(point => {
        queryString += point + ', '
      })
      queryString = queryString.substr(0, queryString.length - 2)

      // Custom time interval fetching using the extract function and the modulus function
      let extUnit = 'MINUTE'
      let extInt = '15'
      let remainder = '0'
      if (req.queryString('unit')) { extUnit = req.queryString('unit').toUpperCase() }
      if (req.queryString('int')) { extInt = req.queryString('int').toUpperCase() }
      if (extUnit !== 'MINUTE' && parseInt(extInt) > 1 && parseInt(extInt) % 2 === 1) { remainder = '1' }

      // this kind of sucks but then we return values we should not include that fall within the months
      // Ex: when selecting 2 hour intervals it would report 15 minute intervals every 2 hours
      let extraTimeConditions = ' '
      if (extUnit !== 'MINUTE') {
        extraTimeConditions += 'AND EXTRACT(MINUTE FROM time) = 0 '
        if (extUnit !== 'HOUR') {
          extraTimeConditions += 'AND EXTRACT(HOUR FROM time) = 0 '
          if (extUnit !== 'DAY') {
            extraTimeConditions += 'AND EXTRACT(DAY FROM time) = 0 '
          }
        }
      }
      queryString += ' FROM ' + table + ' WHERE meter_id=? AND MOD(EXTRACT(' + extUnit + ' FROM time), ' + extInt + ') = ' + remainder + extraTimeConditions + 'AND time >= ? AND time <= ?'
      db.query(queryString, [req.queryInt('id'), req.queryString('date_start'), req.queryString('date_end')]).then(rows => {
        rows.forEach(val => {
          val.time.setTime(val.time.getTime() - val.time.getTimezoneOffset() * 60 * 1000)
        })
        res.send(JSON.stringify(rows))
      }).catch(err => {
        res.status(400).send('400: ' + err.message)
      })
    })
  } else {
    res.status(400).send('400: MISSING PARAMETER')
  }
})

// METER GROUPS
router.post('/updateMeterGroup', function (req, res) {
  if (req.bodyJson().meters && req.bodyInt('id')) {
    // remove all old meters, the update request contains all meter information including those that stay the same
    db.query('DELETE FROM meter_group_relation WHERE group_id=?', [req.bodyInt('id')]).then(rows => {
      let promises = []
      req.bodyJson().meters.forEach(meter => {
        promises.push(db.query('INSERT INTO meter_group_relation (meter_id, group_id, operation) VALUES (?, ?, ?)', [meter.id, req.bodyInt('id'), meter.operation]))
      })
      Promise.all(promises).then(values => {
        res.send('SUCCES: UPDATED ALL METERS IN GROUP')
      }).catch(err => {
        throw err
      })
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  }
  // Update stuff
  if (req.bodyInt('id')) {
    let queryString = 'UPDATE meter_groups SET '
    if (req.bodyString('name')) {
      queryString += "name='" + req.bodyString('name') + "', "
    }
    if (req.bodyInt('is_building')) {
      queryString += 'is_building=' + req.bodyInt('is_building').toString() + ', '
    }
    queryString = queryString.substr(0, queryString.length - 2)
    if (req.bodyInt('is_building') || req.bodyString('name')) {
      db.query(queryString + ' WHERE id=?', [req.bodyInt('id')]).then(rows => {
        res.send('SUCCESS: UPDATED NAME AND/OR BUILDING STATUS')
      })
    }
  } else if (req.bodyString('user_id') && req.bodyString('name')) { // create stuff
    db.query('SELECT * FROM meter_groups WHERE user_id=? AND name=?', [req.bodyString('user_id'), req.bodyString('name')]).then(rows => {
      if (rows.length === 0) {
        db.query('INSERT INTO meter_groups (user_id, name) VALUES (?, ?)', [req.bodyString('user_id'), req.bodyString('name')]).then(rows => {
          if (req.bodyJson().meters) {
            db.query('SELECT id FROM meter_groups WHERE user_id=? AND name=?', [req.bodyString('user_id'), req.bodyString('name')]).then(rows => {
              let promises = []
              req.bodyJson().meters.forEach(meter => {
                promises.push(db.query('INSERT INTO meter_group_relation (meter_id, group_id,operation) VALUES (?,?,?)', [meter.id, rows[0].id, meter.operation]))
              })
              Promise.all(promises).then(values => {
                res.send('SUCCESS: CREATED METER GROUP')
              }).catch(err => {
                throw err
              })
            }).catch(err => {
              throw err
            })
          } else {
            res.send('SUCCESS: CREATED METER GROUP')
          }
        })
      } else { throw new Error('CANT FIND GROUP') }
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.send('ERROR: COULD NOT UPDATE METER GROUP')
  }
})

router.get('/getMeterGroupsForUser', function (req, res) {
  db.query('SELECT * FROM meter_groups WHERE user_id=?', [req.queryInt('id')]).then(rows => {
    res.send(JSON.stringify(rows))
  }).catch(err => {
    res.status(400).send('400: ' + err.message)
  })
})

router.get('/getMetersForGroup', function (req, res) {
  if (req.queryString('id')) {
    db.query('SELECT meters.id, meters.name, meters.type, meter_group_relation.operation FROM meters LEFT JOIN meter_group_relation ON meters.id=meter_group_relation.meter_id WHERE group_id=?', [req.queryString('id')]).then(rows => {
      res.send(JSON.stringify(rows))
    }).catch(err => {
      res.status(400).send('400: ' + err.message)
    })
  } else {
    res.status(400).send('400: NO ID')
  }
})

// Photos
router.get('/listAvailableMedia', function (req, res) {
  fs.readdir('./block-media', (e, files) => {
    if (!e) {
      res.send(JSON.stringify(files.filter(file => {
        return file.toLowerCase().indexOf('.png') !== -1 || file.toLowerCase().indexOf('.jpg') !== -1
      })))
    } else { res.status(400).send('400: ' + e.message) }
  })
})

module.exports = (c) => { cas = c; return router }
