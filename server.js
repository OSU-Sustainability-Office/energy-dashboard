var express = require('express')

var app = express();
var db = require('./db');
var cors = require('cors');
var cookieparser = require('cookie-parser');
var session = require('express-session');
var CASAuthentication = require('r-cas-authentication');


var server = null;





exports.start = function(cb) {
	var cas = new CASAuthentication({
	    cas_url     : 'https://login.oregonstate.edu/idp/profile/cas/login',
	    service_url : 'http://localhost:3000/energy',
			is_dev_mode     : true,
	    dev_mode_user   : 'minerb',
			dev_mode_info: {},
			cas_version : '3.0',
			session_name : 'cas_user',
			session_info : 'cas_userinfo'
	});
	app.use('/block-media',express.static('block-media'));
	app.use(cookieparser());
	app.use( session({
	    secret            : 'super secret key',
	    resave            : false,
	    saveUninitialized : true,
	    cookie: {
	        secure: false, // Secure is Recommeneded, However it requires an HTTPS enabled website (SSL Certificate)
	        maxAge: 864000000 // 10 Days in miliseconds
	    }
	}));
	app.use(require('sanitize').middleware);
	var corsOptions = {
		origin: 'http://localhost:8080',
		credentials: true
	};
	app.use(cors(corsOptions));
	app.use(express.json());
  app.use('/api', cas.block,require('./controllers/api.js')(cas));
	app.get('/energy', cas.bounce, function(req, res) {
		console.log(req.session.id);
		db.query("SELECT * FROM users WHERE name = ?",[req.session[cas.session_name]]).then(val => {
			req.session.user = JSON.parse(JSON.stringify(val))[0];
			res.status(301).redirect('http://localhost:8080/#/account');
		}).catch(e => {
			res.status(403).send("ERROR 403: " + e);
		});

	});
	app.get('/login', cas.bounce_redirect);


	app.get('/logout',cas.logout);
	db.connect(function(err) {
	  if (err) {
	    throw err;
	  }

	  // Only launch the node server it connects successfully.
	  var port = 3000;
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
