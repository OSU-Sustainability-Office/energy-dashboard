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

exports.query = function(sql,args) {
  return new Promise((resolve, reject) => {
    state.db.query(sql, args, (err, rows) => {
      if (err)
          return reject(err);
      resolve(rows);
    });
  });
}
exports.get = function() {
  return state.db;
}

exports.close = function() {
  return new Promise ((resolve, reject) => {
    state.db.end(err => {
      if (err)
          return reject(err);
      resolve();
    });
  });
}