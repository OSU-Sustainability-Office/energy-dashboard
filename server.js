var express = require('express')
var app = express();
var db = require('./db');

app.use('/api', require('./controllers/api.js'));

db.connect(function(err) {
  if (err) {
    throw err;
  }

  // Only launch the node server it connects successfully.
  var port = 3000;
  app.listen(port);
  console.log('Listening on ' + port + '.');
});