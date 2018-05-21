// This node application moves data from the temporary table to the data table.
// This is necessary because some buildings rely on multiple meters to produce
// their consumption data. This application waits until all required data
// points are uploaded before computing the data point, and inserting it into
// the data table.
var dotenv = require('dotenv').config();
var mysql = require('mysql');

// Connect to the MySQL database.
// Login details are stored in a .env file.
var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_DATABASE
});

// Iterates over every datapoint in the temp_data table. For each point, the
// script finds all associated meter objects and performs their calculations on
// the building's respective data point. If the current point doesn't exist,
// it creates one with the current temporary point's timestamp.
function computeData() {
  // Iterate over every data point
  connection.query('SELECT * FROM temp_data', function(err, dataPoints) {
    if (err) throw err;
    dataPoints.forEach(function(point) {
      // Find all associated meter objects
      connection.query('SELECT building_id, operation FROM meters WHERE address = ' + point.meter_address, function(err, meters) {
        if (err) throw err;
        // Iterate over each meter object
        meters.forEach(function(meter) {
          // Find the building's corresponding data point
          var d = new Date(point.time);
          var year = d.getFullYear();
          var month = ("0" + (d.getMonth() + 1)).slice(-2); // 2 digit
          var day = ("0" + d.getDate()).slice(-2);
          var hour = ("0" + d.getHours()).slice(-2);
          var min = ("0" + d.getMinutes()).slice(-2);
          var timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':00';
          connection.query('SELECT * FROM data WHERE (building_id = ' + meter.building_id + ' AND time = "' + timestamp+ '")', function(err, data) {
            if (err) throw err;
            // Perform the operation outlined by the meter object on the building's
            // data point.
            var op = meter.operation.readInt8() == 0 ? 1 : -1; // Set pos/neg

            // If a data point doesn't exist, create a new one
            if (data.length == 0) {
              console.log("Inserting data entry for " + meter.building_id + " at time " + timestamp + ".");
              var ac_r = op * Math.abs(point.accumulated_real);
              var r_p = op * Math.abs(point.real_power);
              var re_p = op * Math.abs(point.reactive_power);
              var a_p = op * Math.abs(point.apparent_power);
              var r_a = op * Math.abs(point.real_a);
              var r_b = op * Math.abs(point.real_b);
              var r_c = op * Math.abs(point.real_c);
              var re_a = op * Math.abs(point.reactive_a);
              var re_b = op * Math.abs(point.reactive_b);
              var re_c = op * Math.abs(point.reactive_c);
              var ap_a = op * Math.abs(point.apparent_a);
              var ap_b = op * Math.abs(point.apparent_b);
              var ap_c = op * Math.abs(point.apparent_c);
              var p_a = op * Math.abs(point.pf_a);
              var p_b = op * Math.abs(point.pf_b);
              var p_c = op * Math.abs(point.pf_c);
              var v_ab = op * Math.abs(point.vphase_ab);
              var v_bc = op * Math.abs(point.vphase_bc);
              var v_ac = op * Math.abs(point.vphase_ac);
              var v_an = op * Math.abs(point.vphase_an);
              var v_bn = op * Math.abs(point.vphase_bn);
              var v_cn = op * Math.abs(point.vphase_cn);
              var c_a = op * Math.abs(point.cphase_a);
              var c_b = op * Math.abs(point.cphase_b);
              var c_c = op * Math.abs(point.cphase_c);
              connection.query(
                'INSERT INTO data (building_id, time, accumulated_real,' +
                ' real_power, reactive_power, apparent_power, real_a, real_b,' +
                ' real_c, reactive_a, reactive_b, reactive_c, apparent_a,' +
                ' apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab,' +
                ' vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn,' +
                ' cphase_a, cphase_b, cphase_c) VALUES (' +
                meter.building_id + ', ' +
                '"' + timestamp + '", ' +
                ac_r + ', ' +
                r_p + ', ' +
                re_p + ', ' +
                a_p + ', ' +
                r_a + ', ' +
                r_b + ', ' +
                r_c + ', ' +
                re_a + ', ' +
                re_b + ', ' +
                re_c + ', ' +
                ap_a + ', ' +
                ap_b + ', ' +
                ap_c + ', ' +
                p_a + ', ' +
                p_b + ', ' +
                p_c + ', ' +
                v_ab + ', ' +
                v_bc + ', ' +
                v_ac + ', ' +
                v_an + ', ' +
                v_bn + ', ' +
                v_cn + ', ' +
                c_a + ', ' +
                c_b + ', ' +
                c_c + ')'
              );
            } else {
              // Otherwise, update the current one
              console.log("Updating data entry for " + meter.building_id + " at time " + timestamp + ".");
              var ac_r = data[0].accumulated_real + op * Math.abs(point.accumulated_real);
              var r_p = data[0].real_power + op * Math.abs(point.real_power);
              var re_p = data[0].reactive_power + op * Math.abs(point.reactive_power);
              var a_p = data[0].apparent_power + op * Math.abs(point.apparent_power);
              var r_a = data[0].real_a + op * Math.abs(point.real_a);
              var r_b = data[0].real_b + op * Math.abs(point.real_b);
              var r_c = data[0].real_c + op * Math.abs(point.real_c);
              var re_a = data[0].reactive_a + op * Math.abs(point.reactive_a);
              var re_b = data[0].reactive_b + op * Math.abs(point.reactive_b);
              var re_c = data[0].reactive_c + op * Math.abs(point.reactive_c);
              var ap_a = data[0].apparent_a + op * Math.abs(point.apparent_a);
              var ap_b = data[0].apparent_b + op * Math.abs(point.apparent_b);
              var ap_c = data[0].apparent_c + op * Math.abs(point.apparent_c);
              var p_a = data[0].pf_a + op * Math.abs(point.pf_a);
              var p_b = data[0].pf_b + op * Math.abs(point.pf_b);
              var p_c = data[0].pf_c + op * Math.abs(point.pf_c);
              var v_ab = data[0].vphase_ab + op * Math.abs(point.vphase_ab);
              var v_bc = data[0].vphase_bc + op * Math.abs(point.vphase_bc);
              var v_ac = data[0].vphase_ac + op * Math.abs(point.vphase_ac);
              var v_an = data[0].vphase_an + op * Math.abs(point.vphase_an);
              var v_bn = data[0].vphase_bn + op * Math.abs(point.vphase_bn);
              var v_cn = data[0].vphase_cn + op * Math.abs(point.vphase_cn);
              var c_a = data[0].cphase_a + op * Math.abs(point.cphase_a);
              var c_b = data[0].cphase_b + op * Math.abs(point.cphase_b);
              var c_c = data[0].cphase_c + op * Math.abs(point.cphase_c);
              connection.query(
                'UPDATE data SET accumulated_real = ' + ac_r +
                ', real_power = ' + r_p +
                ', reactive_power = ' + re_p +
                ', apparent_power = ' + a_p +
                ', real_a = ' + r_a +
                ', real_b = ' + r_b +
                ', real_c = ' + r_c +
                ', reactive_a = ' + re_a +
                ', reactive_b = ' + re_b +
                ', reactive_c = ' + re_c +
                ', apparent_a = ' + ap_a +
                ', apparent_b = ' + ap_b +
                ', apparent_c = ' + ap_c +
                ', pf_a = ' + p_a +
                ', pf_b = ' + p_b +
                ', pf_c = ' + p_c +
                ', vphase_ab = ' + v_ab +
                ', vphase_bc = ' + v_bc +
                ', vphase_ac = ' + v_ac +
                ', vphase_an = ' + v_an +
                ', vphase_bn = ' + v_bn +
                ', vphase_cn = ' + v_cn +
                ', cphase_a = ' + c_a +
                ', cphase_b = ' + c_b +
                ', cphase_c = ' + c_c +
                ' WHERE id = ' + data[0].id
              );
            }
          });
        });
      });
      // Delete this temporary data point
      connection.query('DELETE FROM temp_data WHERE id = ' + point.id);
    });
  });
}

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');

  // Every fifteen minutes, iterate over every building and compute data
  setInterval(function() {
    computeData();
  }, 15 * 60 * 1000); // 15 * 60 * 1000 = 15 minutes in milliseconds
  computeData();
});
