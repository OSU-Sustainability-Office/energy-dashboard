var express = require('express')

var app = express();
var db = require('./db');
var cors = require('cors');
var cookieparser = require('cookie-parser');
var session = require('express-session');
var CASAuthentication = require('r-cas-authentication');
var dotenv = require('dotenv').config();
var server = null;

var path = require('path');
var serveStatic = require('serve-static');
var request = require('request');



exports.start = function(cb) {
	var cas = new CASAuthentication({
	    cas_url     : 'https://login.oregonstate.edu/cas-dev/',
	    service_url : process.env.CAS_SERVICE,
			is_dev_mode     : (process.env.CAS_DEV === "true"),
	    dev_mode_user   : process.env.CAS_DEV_USER,
			dev_mode_info: {},
			cas_version : '3.0',
			session_name : 'cas_user',
			session_info : 'cas_userinfo'
	});
	app.use('/block-media',express.static('block-media'));
	app.use(cookieparser());
	app.use( session({
	    secret            : '1e8ff28baf72619e684cd7397c311b47638624bc',
	    resave            : false,
	    saveUninitialized : true,
	    cookie: {
	        secure: false, // Secure is Recommeneded, However it requires an HTTPS enabled website (SSL Certificate)
	        maxAge: 864000000 // 10 Days in miliseconds
	    }
	}));
	app.use(require('sanitize').middleware);
	if (process.env.CAS_DEV === "true") {
		var corsOptions = {
			origin: 'http://localhost:8080',
			credentials: true
		};
		app.use(cors(corsOptions));
	}
	app.use(express.json());
  app.use('/api', cas.block,require('./controllers/api.js')(cas));
	app.get('/login', cas.bounce, function(req, res) {
		db.query("SELECT * FROM users WHERE name = ?",[req.session[cas.session_name]]).then(val => {
			req.session.user = JSON.parse(JSON.stringify(val))[0];
			if (process.env.CAS_DEV === "true")
				res.status(301).redirect('http://localhost:8080/#/account');
			else
				res.status(301).redirect('http://54.186.223.223:3478/#/account');
		}).catch(e => {
			res.status(403).send("ERROR 403: " + e);
		});

	});
	// app.get('/home', function(req, res) {
	// 	res.sendFile(path.join(__dirname,'/public', 'index.html'));
	// 	//res.send("Test");
	// });
	//app.use(serveStatic(__dirname + "/public"))


	app.get('/', function (req,res) {
		if (req.query.ticket) {
			request("https://login.oregonstate.edu/cas-dev/serviceValidate?ticket="+req.query.ticket+"service=http://54.186.223.223:3478/",function(e,r,b) {
				res.send(b);
			});
		}
		else {
			//request("https://login.oregonstate.edu/cas-dev/login?service=http://54.186.223.223:3478/", function(e,r,b) {
				res.status(301).redirect("https://login.oregonstate.edu/cas-dev/login?service=http://54.186.223.223:3478/");
		//	});
		}
	});

	app.get('/logout',cas.logout);
	db.connect(function(err) {
	  if (err) {
	    throw err;
	  }

	  // Only launch the node server it connects successfully.
	  var port = process.env.PORT;
	  server = app.listen(port);
	  console.log('Listening on ' + port + '.');
	  if (cb)
	  	cb();
	});
}
exports.close = function(cb) {
  if (server) {
  	if (cb)
  		server.close(cb);
  	else
  		server.close();
  	db.close();
  }
}

// when app.js is launched directly
if (module.id === require.main.id) {
	function pass() {

	}
  exports.start();
}
