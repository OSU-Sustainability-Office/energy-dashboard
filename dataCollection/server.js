// Refer to package.json for metadata about this server.
var dotenv = require('dotenv').config();
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');

// Initialize body parser to parse post bodies into useful JSON
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({limit: '50mb'}));

// Insert one point
function insertPoint(record, res, meter_id) {
  console.log("Inserting meter data into table from: " + record.time._);
  var point = record.point;
  record.point.forEach(function(p) {
    p = Math.abs(p);
  })
  var query = 'INSERT INTO data (meter_id, time, accumulated_real, real_power, reactive_power, apparent_power, real_a, real_b, real_c, reactive_a, reactive_b, reactive_c, apparent_a, apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab, vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn, cphase_a, cphase_b, cphase_c) VALUES ("' + res[0].id + '","' + record.time._ + '",' + point[0].$.value + ',' + point[21].$.value + ',' + point[22].$.value + ',' + point[23].$.value + ',' + point[51].$.value + ',' + point[52].$.value + ',' + point[53].$.value + ',' + point[54].$.value + ',' + point[55].$.value + ',' + point[56].$.value + ',' + point[57].$.value + ',' + point[58].$.value + ',' + point[59].$.value + ',' + point[60].$.value + ',' + point[61].$.value + ',' + point[62].$.value + ',' + point[63].$.value + ',' + point[64].$.value + ',' + point[65].$.value + ',' + point[66].$.value + ',' + point[67].$.value + ',' + point[68].$.value + ',' + point[69].$.value + ',' + point[70].$.value + ',' + point[71].$.value + ')';
  connection.query(query);
}

// Inserts a record if it is a 15 minute interval point
function insertRecord(record, res, meter_id) {
  // Check to see if the point is 15 minute data
  if (record.time._.substring(14, 16) % 15 == 0) {
    // Now, add temp data.
    // In the event that a meter was created, res[0] is null, so we need to query for the meter's id again.
    if (res[0]) {
      if (record.point.length > 71) insertPoint(record, res, meter_id);
    } else {
      // Query again.
      connection.query('SELECT id FROM meters WHERE address = "' + meter_id + '"', function(err, res) {
        if (err) throw err;
        if (record.point.length > 71) insertPoint(record, res, meter_id);
      });
    }
  } else {
    console.log("Meter data from: " + record.time._ + " not inserted because it is not 15 minute interval data.");
  }
}

function iterateRecords(device, res, meter_id) {
  // Iterate over each record being uploaded
  // If there is only one record being uploaded, device.records.record is not
  // an array. Before iterating, test if the record is an array.
  if (device.records.record.length != null) {
    // Iterate over each record, and insert it
    for (var i = 0; i < device.records.record.length; i++) {
      insertRecord(device.records.record[i], res, meter_id);
    }
  } else {
    // Insert the only record
    insertRecord(device.records.record, res, meter_id);
  }
}

// Inserts data into the temporary table in the database.
var insertData = function insertData(device, serial) {
  var meter_id = serial + "_" + device.address;

  // Check if the meter exists. If yes, insert the data into temp. If
  // no, then insert the meter into the meters table before adding the
  // temp data.
  connection.query('SELECT id FROM meters WHERE address = "' + meter_id + '"', function(err, res) {
    if (err) throw err;
    // if none found, insert
    if (res.length == 0) {
      console.log("Creating new meter: " + meter_id);
      connection.query('INSERT INTO meters (name, address) VALUES ("' + device.name + '","' + meter_id + '")', function (err, res) {
        if (err) throw err;
        iterateRecords(device, res, meter_id);
      });
    } else {
      iterateRecords(device, res, meter_id);
    }
  });
};

// Receives acquisuite log file uploads in XML format. Converts to JSON, then
// inserts into the temporary table on our MySQL database.
app.post('/devices/upload', xmlparser({
    trim: false,
    explicitArray: false
}), function (req, res) {
    if (req.body.das && req.body.das.mode == 'LOGFILEUPLOAD') {
        var serial = req.body.das.serial;
        console.log('Received XML data from ' + serial + ' on: ' + new Date().toUTCString());

        // If multiple meters are connected, device is an array. Check for
        // multiple meters
        if (req.body.das.devices.device.length != null) {
          console.log("There are multiple devices! Iterating over all of them...");
          // Iterate over each meter that is connected to this acquisuite
          for (var i = 0; i < req.body.das.devices.device.length; i++) {
            insertData(req.body.das.devices.device[i], serial);
          }
        } else {
          console.log("There is only one device! Inserting data...");
          insertData(req.body.das.devices.device, serial);
        }
    } else {
        console.log('Acquisuite STATUS file received. It looks nice, but I\'m not going to do anything with it.');
    }

    // Send a positive response to the acquisuite.
    res.status('200');
    res.set({
        'content-type': 'text/xml',
        'Connection': 'close'
    });
    res.send('<?xml version="1.0" encoding="UTF-8" ?>\n' +
        '<result>SUCCESS</result>\n' +
        '<DAS></DAS>' +
        '</xml>');
});

// Asynchronously connect to the MySQL database.
// Login details are stored in a .env file.
var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_DATABASE
});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
  // Only launch the node server it connects successfully.
  var port = process.env.port | 6121;
  app.listen(port);
  console.log('Collecting data on port ' + port + '.');
});
