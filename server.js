var express = require('express')
var app = express();
var db = require('./db');

var server = null;

exports.start = function(cb) {
  	app.use('/api', require('./controllers/api.js'));

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