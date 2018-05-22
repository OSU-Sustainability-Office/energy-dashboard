var mysql = require('mysql');
var dotenv = require('dotenv').config();

var state = {
  db: null
}


exports.connect = function(done){
  if (state.db) return done();
  state.db = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database : process.env.RDS_DATABASE
  });
  state.db.connect(function(err){
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to Database');
  });
  done();
}

exports.get = function() {
  return state.db;
}

exports.close = function(done) {
  state.db.end();
  done();
}