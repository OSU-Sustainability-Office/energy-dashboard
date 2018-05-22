var express = require('express');
var router = express.Router();
var db = require('../db');

//BUILDINGS

router.get('/getBuildingData',function (req,res) {

	var start = req.query.startDate;
	var end = req.query.endDate;
	var range = req.query.range;

	//date selection as specified by the docs.
	if (range) {
		var regexRange = /[0-9]+(y)|[0-9]+(m)|[0-9]+(d)|[0-9]+(h)|[0-9]+(i)/.exec(range);
		var rArray = [regexRange];
		while (regexRange) {
			range = range.replace(regexRange[0],"");
			regexRange = /[0-9]+(y)|[0-9]+(m)|[0-9]+(d)|[0-9]+(h)|[0-9]+(i)/.exec(range);
			rArray.push(regexRange);
		}
		rArray.splice(-1,1);

		if (!end && start) {
			end = new Date(start);
			for (var i = 0; i < rArray.length; i++) {
				var type = rArray[i][0].substring(rArray[i][0].length-1);
				var	amount = rArray[i][0].substring(0,rArray[i][0].length-1);
				if (type === 'y') {
					end.setFullYear(end.getFullYear() + parseInt(amount));
				}
				else if (type === 'm') {
					end.setMonth(end.getMonth() + parseInt(amount));
				}
				else if (type === 'd') {
					end.setDate(end.getDate() + parseInt(amount));
				}
				else if (type === 'h') {
					end.setHours(end.getHours() + parseInt(amount));
				}
				else if (type === 'i') {
					end.setMinutes(end.getMinutes() + parseInt(amount));
				}
			}
			end = end.toISOString();
		}
		else if(!start && end) {
			start = new Date(end);
			for (var i = 0; i < rArray.length; i++) {
				var type = rArray[i][0].substring(rArray[i][0].length-1);
				var	amount = rArray[i][0].substring(0,rArray[i][0].length-1);
				if (type === 'y') {
					start.setFullYear(start.getFullYear() - parseInt(amount));
				}
				else if (type === 'm') {
					start.setMonth(start.getMonth() - parseInt(amount));
				}
				else if (type === 'd') {
					start.setDate(start.getDate() - parseInt(amount));
				}
				else if (type === 'h') {
					start.setHours(start.getHours() - parseInt(amount));
				}
				else if (type === 'i') {
					start.setMinutes(start.getMinutes() - parseInt(amount));
				}
			}
			start = start.toISOString();
		}
		else if (!end && !start) {
			end = new Date();
			start = new Date();
			for (var i = 0; i < rArray.length; i++) {
				var type = rArray[i][0].substring(rArray[i][0].length-1);
				var	amount = rArray[i][0].substring(0,rArray[i][0].length-1);
				if (type === 'y') {
					start.setFullYear(start.getFullYear() - parseInt(amount));
				}
				else if (type === 'm') {
					start.setMonth(start.getMonth() - parseInt(amount));
				}
				else if (type === 'd') {
					start.setDate(start.getDate() - parseInt(amount));
				}
				else if (type === 'h') {
					start.setHours(start.getHours() - parseInt(amount));
				}
				else if (type === 'i') {
					start.setMinutes(start.getMinutes() - parseInt(amount));
				}
			}
			end = end.toISOString();
			start = start.toISOString();
		}
	}
	if (!end || !start) {
		res.send("ERROR: UNSPECIFIED TIME RANGE");
		return;
	}
	



	function idCallback(id) {
		var queryString = "SELECT time, ";
		var mPoints = req.query.mpoints.split(',');
		for (var i = 0; i < mPoints.length; i++) {
			queryString = queryString + mPoints[i];
			if (i+1 !== mPoints.length) {
				queryString = queryString + ", "
			}
		}
		queryString = queryString + " FROM data WHERE building_id=?";
		db.get().query(queryString,[id],function(err,result){
			if (err) {
				console.log(err);
			}
			res.send(JSON.stringify(result));
		});
	}
	if (!req.query.mpoints) {
		res.send("ERROR: NO METERING POINT(S) SPECIFIED");
		return;
	}
	var id = req.query.id;
	//check for id first
	if (id) {
		idCallback(id);
	}
	else if (!id && !req.query.name) {
		res.send("ERROR: NO NAME OR ID SPECIFIED");
		return;
	}
	else if (req.query.name){
		db.get().query("SELECT id FROM buildings WHERE NAME=?",[req.query.name],function(err,result){
			idCallback(result[0].id);
			console.log(result[0].id);
		});
	}

});

router.post('/updateBuilding',function (req,res) {
	//update building
	if (req.query.id) {

	}
	//Create new building
	else {

	}
});


//BLOCKS

router.get('/getBlockData',function (req,res) {

});

router.post('/updateBlock',function (req,res) {

});

//DASHBOARDS

router.get('/getDashboard',function (req,res) {

});

router.post('/updateDashboard',function (req,res) {

});

//STORIES

router.get('/getStory',function (req,res) {

});

router.post('/updateStory',function (req,res) {

});


module.exports = router;