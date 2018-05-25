// Old route leaving for controller computation of 
// range
router.get('/getBuildingData',function (req,res) {

	var start = req.queryString('startDate');
	var end = req.queryString('endDate');
	var range = req.queryString('range');

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
	



	if (!req.query.mpoints) {
		res.send("ERROR: NO METERING POINT(S) SPECIFIED");
		return;
	}
	var id = req.queryInt('id');
	//check for id first
	if (id) {
		var queryString = "SELECT time, ";
		var mPoints = req.queryString('mpoints').split(',');
		for (var i = 0; i < mPoints.length; i++) {
			queryString = queryString + mPoints[i];
			if (i+1 !== mPoints.length) {
				queryString = queryString + ", "
			}
		}
		queryString = queryString + " FROM data WHERE building_id=? AND ? < time AND ? > time";
		
		db.query(queryString,[id,start,end]).then(rows => {
			res.send(JSON.stringify(rows));
		});
	}
	else if (!id && !req.queryString('name')) {
		res.send("ERROR: NO NAME OR ID SPECIFIED");
		return;
	}
	else if (req.query.name){
		db.query("SELECT id FROM buildings WHERE NAME=?",[req.queryString('name')]).then(rows => {
			var queryString = "SELECT time, ";
			var mPoints = req.queryString('mpoints').split(',');
			for (var i = 0; i < mPoints.length; i++) {
				queryString = queryString + mPoints[i];
				if (i+1 !== mPoints.length) {
					queryString = queryString + ", "
				}
			}
			queryString = queryString + " FROM data WHERE building_id=? AND ? < time AND ? > time";
			
			db.query(queryString,[rows[0].id, start, end]).then(rows => {
				res.send(JSON.stringify(rows));
			});
		});
	}

});

router.post('/updateBuilding',function (req,res) {
	//update building
	if (req.bodyInt('id')) {
		if (req.bodyString('name')) {
			//first change building name but only if needed
			db.query("UPDATE buildings SET Name=? WHERE id=?",[req.bodyString('name'), req.bodyInt('id')]).then(rows => {
				res.send("SUCCESS: UPDATED BUILDING NAMES");
			});
		}
		if (req.body.meters) {
			//first delete all meters associated with the building, this should be okay because the update
			//request will contain all meters with that building including those that stay the same
			db.query("DELETE FROM meters WHERE building_id=?",[req.bodyInt('id')]).then(rows => {
				for (meter in req.body.meters) {
					if (meter.name && meter.address && meter.building_id && meter.operation)
						//for each meter add them into the meters database
						db.query("INSERT INTO meters (Name, address, building_id, operation VALUES (?, ?, ?, ?)",[meter.name, meter.address, meter.building_id, meter.operation]).then(rows => {
							res.send("SUCCESS: ADDED METER TO BUILDING")
						});
				}
			});
		}
	}
	//Create new building
	else {
		//check that we have name to give the building
		if (req.bodyString('name')) {
			//first make sure name is unique
			dq.query("SELECT id FROM buildings WHERE Name=?",[req.bodyString('name')]).then(rows => {
				//Array is not length 0, or only null, or not an array
				if (!Array.isArray(rows) || !rows.length) {
					//put that dude in the database
					dq.query("INSERT INTO buildings (Name) VALUES (?)",[req.bodyString('name')]).then(rows => {
						//associate meters with building if specified 
						if (req.body.meters) {
							for (meter in req.body.meters) {
								//for each meter add them into the meters database
								db.query("INSERT INTO meters (Name, address, building_id, operation VALUES (?, ?, ?, ?)",[meter.name, meter.address, meter.building_id, meter.operation]).then(rows => {
									res.send("SUCCESS: ADDED METER TO BUILDING")
								});
							}
						}
					});
				}
			});
		}
	}
});