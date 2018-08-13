const express = require('express')

const app = express()
const db = require('./db')
const cors = require('cors')
const cookieparser = require('cookie-parser')
const session = require('express-session')
const CASAuthentication = require('r-cas-authentication')
let server = null

const FileStore = require('session-file-store')(session)
const path = require('path')

require('dotenv').config()
require('serve-static')

exports.start = function (cb) {
  const cas = new CASAuthentication({
    cas_url: 'https://login.oregonstate.edu/cas-dev/',
    service_url: process.env.CAS_SERVICE,
    is_dev_mode: (process.env.CAS_DEV === 'true'),
    dev_mode_user: process.env.CAS_DEV_USER,
    dev_mode_info: {},
    cas_version: '2.0',
    session_name: 'cas_user',
    session_info: 'cas_userinfo'
  })
  app.use('/block-media', express.static('block-media'))
  app.use(cookieparser())
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  }))

  app.use(require('sanitize').middleware)

  if (process.env.CAS_DEV === 'true') {
    const corsOptions = {
      origin: 'http://localhost:8080',
      credentials: true
    }
    app.use(cors(corsOptions))
  }

  app.use(express.json())
  app.use('/api', require('./controllers/api.js')(cas))

  app.get('/login', cas.bounce, function (req, res) {
    db.query('SELECT * FROM users WHERE name = ?', [req.session[cas.session_name]]).then(val => {
      console.log(val)
      if (val.length > 0) {
        req.session.user = JSON.parse(JSON.stringify(val))[0]
        if (process.env.CAS_DEV === 'true') {
          res.status(301).redirect('http://localhost:8080/#/account')
        } else {
          res.status(301).redirect('http://52.39.141.177:3478/#/account')
        }
      } else {
        db.query('INSERT INTO users (name, privilege) VALUES (?,?)', [[req.session[cas.session_name]], 1]).then(r => {
          req.session.user = {}
          req.session.user.id = r.insertId
          req.session.user.privilege = 1
          req.session.user.name = [req.session[cas.session_name]]
          if (process.env.CAS_DEV === 'true') {
            res.status(301).redirect('http://localhost:8080/#/account')
          } else {
            res.status(301).redirect('http://52.39.141.177:3478/#/account')
          }
        }).catch(e => {
          throw e
        })
      }
    }).catch(e => {
      res.status(403).send('403: ' + e.message)
    })
  })

  app.get('/undefined', function (req, res) {
    db.query('SELECT * FROM users WHERE name = ?', [req.session[cas.session_name]]).then(val => {
      if (val.length > 0) {
        req.session.user = JSON.parse(JSON.stringify(val))[0]
        if (process.env.CAS_DEV === 'true') {
          res.status(301).redirect('http://localhost:8080/#/account')
        } else {
          res.status(301).redirect('http://52.39.141.177:3478#/account')
        }
      } else {
        db.query('INSERT INTO users (name, privilege) VALUES (?,?)', [[req.session[cas.session_name]], 1]).then(r => {
          req.session.user = {}
          req.session.user.id = r.insertId
          req.session.user.privilege = 1
          req.session.user.name = [req.session[cas.session_name]]
          if (process.env.CAS_DEV === 'true') {
            res.status(301).redirect('http://localhost:8080/#/account')
          } else {
            res.status(301).redirect('http://52.39.141.177:3478/#/account')
          }
        }).catch(e => {
          throw e
        })
      }
    }).catch(e => {
      res.status(403).send('ERROR 403: ' + e)
    })
  })

  app.use(express.static(path.join(__dirname, '/public')))

  app.get('/logout', cas.logout)
  db.connect(function (err) {
    if (err) {
      throw err
    }
    // Only launch the node server it connects successfully.
    const port = process.env.PORT
    server = app.listen(port)
    console.log('Listening on ' + port + '.')
    if (cb) { cb() }
  })
}

exports.close = function (cb) {
  if (server) {
    if (cb) {
      server.close(cb)
    } else {
      server.close()
    }
    db.close()
  }
}

// when app.js is launched directly
if (module.id === require.main.id) {
  exports.start()
}
