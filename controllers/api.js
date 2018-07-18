var express = require('express');
var router = express.Router();
var db = require('../db');
var cas = null;
var fs = require('fs');

router.use(require('sanitize').middleware);

router.get('/currentUser',function(req,res){
	res.send(req.session[cas.session_name]);
});
router.get('/currentUserID',function(req,res){
	res.send(req.session.id);
});
//High privilige
router.get('/getAllUsers', function(req,res){
	if (req.sesion.user.privilege <= 2) {
		res.status(403).send("403: NON PRIVILIGED USER")
	}
	else {
		db.query("SELECT * FROM users").then (rows => {
			res.send(rows);
		}).catch(err => {
			res.send("error");
		});
	}
});
router.get('/getAllMeterGroups', function(req,res){
	if (req.sesion.user.privilege <= 2) {
		res.status(403).send("403: NON PRIVILIGED USER")
	}
	else {
		db.query("SELECT * FROM meter_groups").then (rows => {
			res.send(rows);
		}).catch(err => {
			res.send("error");
		});
	}
});

//router.delete('/deleteMeterGroup')


//BUILDINGS
router.get('/getAllBuildings',function (req,res) {
	db.query("SELECT id, name FROM meter_groups WHERE is_building=1").then( rows => {
		res.send(rows);
	}).catch( err => {
		res.send("ERROR: COULD NOT GET BLOCK");
	});
});

//BLOCKS
router.get('/getBlock',function (req,res) {
	if (req.queryString('id')) {
		db.query("SELECT * FROM blocks WHERE id=?",[req.queryString('id')]).then(rows => {
			res.send(JSON.stringify(rows));
		}).catch( err => {
			res.send("ERROR: COULD NOT GET BLOCK");
		});
	}
	else {
		res.send("ERROR: COULD NOT GET BLOCK");
	}

});
router.get('/getBlockMeterGroups',function (req,res) {
	if (req.queryString('id')) {
		db.query("SELECT * FROM block_groups WHERE block_id=?",[req.queryString('id')]).then(rows => {
			res.send(JSON.stringify(rows));
		}).catch( err => {
			res.send("ERROR: COULD NOT GET BLOCK");
		});
	}
	else {
		res.send("ERROR: COULD NOT GET BLOCK");
	}

});
router.get('/getBlockDataForStory',function (req,res) {
	//for a story names need to be unique so we can find the block this way
	if (req.queryString('id')) {
		db.query("SELECT * FROM blocks WHERE story_id=?",[req.queryString('id')]).then(rows => {
			res.send(JSON.stringify(rows));
		});
	}
	else {
		res.status(400).send("400: NO STORY ID");
	}

});

router.post('/deleteBlock', function(req, res) {
	if (req.bodyInt('id')) {
		db.query("SELECT stories.user_id, blocks.id FROM blocks LEFT JOIN stories ON blocks.story_id = stories.id WHERE blocks.id = ?",[req.bodyInt('id')]).then(rows => {
				if(rows[0].user_id === req.session.user.id) {
					db.query("DELETE FROM block_groups WHERE block_id=?",[req.bodyInt('id')]).then(val => {
						db.query("DELETE FROM blocks WHERE id=?",[req.bodyInt('id')]).then(val => {
							res.send("DELETED BLOCK");
						}).catch(err => {
							throw err;
						});
					}).catch(err => {
						throw err;
					});
				}
				else
					throw "error";
		}).catch(err => {
			console.log(err);
			res.status(400).send("400: "+err);
		});
	}
	else {
		res.status(401).send("401: NOT AUTHORIZED");
	}
});

router.post('/updateBlock',function (req,res) {
	//update
	if (req.bodyInt('id')) {
		var promises = [];
		var e = null;
		db.query("SELECT stories.user_id, blocks.id FROM blocks LEFT JOIN stories ON blocks.story_id = stories.id WHERE blocks.id = ?",[req.bodyInt('id')]).then(rows => {
				if(rows[0].user_id === req.session.user.id) {
					if (req.bodyJson().meter_groups.length > 0) {
						db.query("DELETE FROM block_groups WHERE block_id=?",[req.bodyInt('id')]).then(rows => {
							for (meter_group of req.bodyJson().meter_groups) {
								promises.push(db.query("INSERT INTO block_groups (block_id, group_id, point, name) VALUES (?,?,?,?)",[req.bodyInt('id'),meter_group.id, meter_group.point, meter_group.name]));
							}
						}).catch(err => {
							throw err;
						});
					}
					var queryString = 'UPDATE blocks SET ';
					if (req.bodyString('date_end')) {
						queryString += 'date_end="'+req.bodyString('date_end')+'", ';
					}
					if (req.bodyString('date_start')) {
						queryString += 'date_start="'+req.bodyString('date_start')+'", ';
					}
					if (req.bodyString('date_range')) {
						queryString += 'date_range="'+req.bodyString('date_range')+'", ';
					}
					if (req.bodyInt('graph_type')) {
						queryString += 'graph_type="'+req.bodyInt('graph_type')+'", ';
					}
					if (req.bodyString('media')) {
						queryString += 'media="'+req.bodyString('media')+'", ';
					}
					if (req.bodyString('descr')) {
						queryString += 'descr="'+req.bodyString('descr')+'", ';
					}
					if (req.bodyString('name')) {
						queryString += 'name="'+req.bodyString('name')+'", ';
					}
					if (req.bodyString('interval')) {
						queryString += 'date_interval='+req.bodyInt('interval')+', ';
					}
					if (req.bodyString('unit')) {
						queryString += 'interval_unit="'+req.bodyString('unit')+'", ';
					}
					queryString = queryString.substr(0, queryString.length -2);
					queryString += " WHERE id="+req.bodyInt('id');
					promises.push(db.query(queryString));
					Promise.all(promises).then(() =>{
						res.status(200).send("200: UPDATED BLOCK");
					}).catch(err => {
						console.log(err);
						res.status(400).send("400: " + err);
					});
				}
				else
					res.status(401).send("401: NOT AUTHORIZED");
		}).catch(err => {
			console.log(err);
			res.status(400).send("400: " + err);
		});
	}
	//create
	else if (req.bodyInt('story_id')) {
		var promises = [];
		db.query("SELECT * FROM stories where id=?",[req.bodyInt('story_id')]).then(val => {
			if (val === null || val[0].user_id !== req.session.user.id)
				res.status(400).send("400: BAD STORY ID")
			else {
				var queryString = 'INSERT INTO blocks (story_id';
				var valuesString = "("+req.bodyInt('story_id');
				if (req.bodyString('date_start')) {
					queryString += ",date_start";
					valuesString += ",'" + req.bodyString('date_start')+"'";
				}
				if (req.bodyString('date_end')) {
					queryString += ",date_end";
					valuesString += ",'" + req.bodyString('date_end')+"'";
				}
				if (req.bodyString('date_range')) {
					queryString += ",date_range";
					valuesString += ",'" + req.bodyString('date_range')+"'";
				}
				if (req.bodyInt('graph_type')) {
					queryString += ",graph_type";
					valuesString += "," + req.bodyInt('graph_type');
				}
				if (req.bodyString('media')) {
					queryString += ",media";
					valuesString += ",'" + req.bodyString('media')+"'";
				}
				if (req.bodyString('descr')) {
					queryString += ",descr";
					valuesString += ",'" + req.bodyString('descr')+"'";
				}
				if (req.bodyString('name')) {
					queryString += ",name";
					valuesString += ",'" + req.bodyString('name')+"'";
				}

				db.query(queryString+") VALUES "+valuesString+")").then(rows => {
					for (meter_group of req.bodyJson().meter_groups) {
						promises.push(db.query("INSERT INTO block_groups (block_id, group_id, point, name) VALUES (?,?,?,?)",[rows.insertId,meter_group.id, meter_group.point, meter_group.name]));
					}
					Promise.all(promises).then(() => {
						res.status(201).send(JSON.stringify(rows.insertId));
					}).catch(err => {
						res.status(400).send("400: "+ err);
					});
				});
			}
		});
	}
});

//STORIES
router.post('/changeFeaturedStory',function(req, res) {
	if (req.bodyInt('id') && req.session.user.id) {
		db.query("SELECT * FROM stories WHERE user_id=?",[req.session.user.id]).then(rows => {
			var promises = [];
			rows.forEach(r => {
				if (r.id === req.bodyInt('id')) {
					promises.push(db.query("UPDATE stories SET featured=1 WHERE id=?",[r.id]));
				}
				else {
					promises.push(db.query("UPDATE stories SET featured=0 WHERE id=?",[r.id]));
				}
			});
			Promise.all(promises).then(() => {
				res.send("200: UPDATED FEATURED STORY");
			}).catch(e => {
				throw e;
			});
		}).catch(e => {
			res.status(400).send("400: "+e);
		});
	}
	else {
		res.status(400).send("400: NO ID SPECIFIED");
	}
});
router.get('/getStoryData',function (req,res) {
	//get a story by its id
	if (req.queryInt('id')) {
		db.query('SELECT * FROM stories WHERE id=?',[req.queryInt('id')]).then(rows => {
			res.send(JSON.stringify(rows));
		});
	}
	else {
		res.send('ERROR: ID NOT SPECIFIED');
	}

});
router.get('/getBlocksForStory',function (req,res) {
	if (req.queryString('id')) {
		db.query('SELECT * FROM blocks WHERE story_id=?',[req.queryString('id')]).then( rows => {
			rows.forEach(val=> {
				val.date_start.setTime(val.date_start.getTime() - val.date_start.getTimezoneOffset()*60*1000);
				val.date_end.setTime(val.date_end.getTime() - val.date_end.getTimezoneOffset()*60*1000);
			});
			res.send(JSON.stringify(rows));
		}).catch(err => {
			res.send("ERROR: COULD NOT RETRIEVE BLOCKS");
		});
	}
	else {
		res.send("ERROR: COULD NOT RETRIEVE BLOCKS");
	}
});
router.get('/getStoriesForCurrentUser',function (req,res) {
	if (req.session.user.id) {
		db.query('SELECT * FROM stories WHERE user_id=?',req.session.user.id).then( rows => {
			res.send(JSON.stringify(rows));
		}).catch(err => {
			res.send("ERROR: COULD NOT RETRIEVE BLOCKS");
		});
	}
	else {
		res.status(400).send("400: COULD NOT RETRIEVE BLOCKS");
	}
});
router.get('/getPublicStories',function (req,res){
	db.query('SELECT * FROM stories WHERE public=1').then(rows => {
		res.send(JSON.stringify(rows));
	});

});
router.post('/deleteStory',function (req,res){
	db.query('SELECT user_id FROM stories WHERE id=?',[req.bodyInt('id')]).then(rows => {
		if (rows[0].user_id === req.session.user.id) {
			db.query('DELETE block_groups FROM block_groups JOIN blocks ON blocks.id=block_groups.block_id WHERE blocks.story_id = ?',[req.bodyInt('id')]).then(val => {
				db.query('DELETE FROM blocks WHERE story_id=?',[req.bodyInt('id')]).then(v => {
					db.query('DELETE FROM stories WHERE id=?',[req.bodyInt('id')]).then(va => {
						res.send("DELETED STORY");
					}).catch(err => {
						throw err;
					});
				}).catch(err => {
						throw err;
				});
			}).catch(err => {
				res.status(400).send("400: "+err);
			});
		}
		else {
			throw "error";
		}
	}).catch(err => {
		res.status(400).send("400: "+err);
	});

});
router.post('/updateStory',function (req,res) {
 if (req.bodyInt('id')) {
	 db.query("SELECT user_id FROM stories where id=?",[req.bodyInt('id')]).then(val => {
		 if (val[0].user_id === req.session.user.id) {
				var queryString = "UPDATE stories SET ";
				if (req.bodyString('name')) {
					queryString += 'name="'+req.bodyString('name')+'", ';
				}
				if (req.bodyString('descr')) {
					queryString += 'description="'+req.bodyString('descr')+'", ';
				}
				if (req.bodyString('media')) {
					queryString += 'media="'+req.bodyString('media')+'", ';
				}
				if (req.bodyInt('public')  && req.session.user.privilige >= 3) {
					queryString += 'public='+req.bodyInt('public')+", ";
				}
				queryString = queryString.substr(0, queryString.length -2);
				queryString += 'WHERE id=' + req.bodyInt('id');
				db.query(queryString).then( rows => {
					res.status(200).send("200: UPDATED STORY");
				}).catch(err => {
					res.status(400).send("400: "+ err);
				});
			}
			else
				res.status(401).send("401: INVALID USER")
		}).catch(err => {
			res.status(400).send("400: "+err);
		});
	}
	else if (req.bodyString('name')) {
		var queryString = "INSERT INTO stories (user_id, name,";
		var answers = [req.session.user.id,req.bodyString('name')];
		if (req.bodyString('descr')) {
			queryString += 'description,';
			answers.push(req.bodyString('descr'));
		}
		if (req.bodyInt('public') && req.session.user.privilige >= 3) {
			queryString += 'public,';
			answers.push(req.bodyInt('public'));
		}
		queryString = queryString.substr(0, queryString.length-1);
		queryString += ") VALUES (";
		for (var a = 0; a < answers.length; a++) {
			queryString += '?';
			if ( a !== answers.length-1)
				queryString += ',';
		}
		queryString += ")";
		db.query(queryString,answers).then(rows => {
			res.status(201).send(JSON.stringify(rows.insertId));
		}).catch( err => {
			console.log(err);
			res.status(400).send("400: "+err);
		});
	}
});

//METERS
router.get('/getDefaultMeters',function (req,res) {
	db.query('SELECT * FROM meters').then(rows => {
		res.send(JSON.stringify(rows));
	}).catch(err => {
		res.send("ERROR: COULD NOT GET DEAULT METERS");
	});
});
router.get('/getMeterData',function (req,res) {
	if (req.queryString('date_end') && req.queryString('date_start') && req.queryInt('id') && req.queryString('mpoints')) {
		var queryString = "SELECT time, meter_id, ";
		req.queryString('mpoints').split(',').forEach(point => {
			queryString += point + ", ";
		});
		queryString = queryString.substr(0,queryString.length-2);

		//Custom time interval fetching using the extract function and the modulus function
		var extUnit = "MINUTE";
		var extInt = "15";
		var remainder = "0";
		if (req.queryString('unit'))
			extUnit = req.queryString('unit').toUpperCase();
		if (req.queryString('int'))
			extInt = req.queryString('int').toUpperCase();

		if (extUnit !== "MINUTE" && parseInt(extInt) > 1 && parseInt(extInt)%2 === 1)
			remainder = "1";

		//this kind of sucks but then we return values we should not include that fall within the months
		//Ex: when selecting 2 hour intervals it would report 15 minute intervals every 2 hours
		var extraTimeConditions = " ";
		if (extUnit !== "MINUTE") {
			extraTimeConditions += "AND EXTRACT(MINUTE FROM time) = 0 ";
			if (extUnit !== "HOUR") {
				extraTimeConditions += "AND EXTRACT(HOUR FROM time) = 0 ";
				if (extUnit !== "DAY") {
					extraTimeConditions += "AND EXTRACT(DAY FROM time) = 0 ";
				}
			}
		}

		queryString += " FROM data WHERE meter_id=? AND MOD(EXTRACT("+extUnit+" FROM time), "+extInt+") = "+remainder+extraTimeConditions+"AND time >= ? AND time <= ?";
		db.query(queryString,[req.queryInt('id'),req.queryString('date_start'),req.queryString('date_end')]).then( rows => {
			rows.forEach(val=> {
				val.time.setTime(val.time.getTime() - val.time.getTimezoneOffset()*60*1000);
			});
			res.send(JSON.stringify(rows));
		}).catch ( err => {
			console.log(err);
			res.send("ERROR: COULD NOT SEND DATA");
		});
	}
	else {
		res.send("ERROR: COULD NOT GET DATA");
	}
});

//METER GROUPS
router.post('/updateMeterGroup', function (req,res) {
	if (req.bodyJson().meters && req.bodyInt('id')) {
		//remove all old meters, the update request contains all meter information including those that stay the same
		db.query("DELETE FROM meter_group_relation WHERE group_id=?",[req.bodyInt('id')]).then( rows => {
			var promises = [];
			req.bodyJson().meters.forEach(meter => {
				promises.push(db.query("INSERT INTO meter_group_relation (meter_id, group_id, operation) VALUES (?, ?, ?)",[meter.id ,req.bodyInt('id'), meter.operation]));
			});
			Promise.all(promises).then( values => {
				res.send("SUCCES: UPDATED ALL METERS IN GROUP");
			}).catch( err => {
				throw "error";
			})
		}).catch(err => {
			res.send("ERROR: COULD NOT UPDATED METRSIN GROUP");
		});
	}
	//Update stuff
	if (req.bodyInt('id')) {
		var queryString = "UPDATE meter_groups SET ";
		if (req.bodyString('name')) {
			queryString += "name='" + req.bodyString("name") + "', ";
		}
		if (req.bodyInt('is_building')) {
			queryString += "is_building=" + req.bodyInt('is_building').toString() + ", ";
		}
		queryString = queryString.substr(0, queryString.length -2 );
		if (req.bodyInt('is_building') || req.bodyString('name'))
			db.query(queryString+" WHERE id=?",[req.bodyInt('id')]).then(rows => {
				res.send("SUCCESS: UPDATED NAME AND/OR BUILDING STATUS");
			});
	}

	//create stuff
	else if (req.bodyString('user_id') && req.bodyString('name')) {
		db.query("SELECT * FROM meter_groups WHERE user_id=? AND name=?",[req.bodyString('user_id') ,req.bodyString('name')]).then( rows => {
			if (rows.length === 0)
				db.query("INSERT INTO meter_groups (user_id, name) VALUES (?, ?)",[req.bodyString('user_id'), req.bodyString('name')]).then(rows => {
					if (req.bodyJson().meters) {
						db.query("SELECT id FROM meter_groups WHERE user_id=? AND name=?",[req.bodyString('user_id') ,req.bodyString('name')]).then(rows => {
							req.bodyJson().meters.forEach( meter => {
								promises.push(db.query("INSERT INTO meter_group_relation (meter_id, group_id,operation) VALUES (?,?,?)",[meter.id,rows[0].id,meter.operation]));
							});
							Promise.all(promises).then( values => {
								res.send("SUCCESS: CREATED METER GROUP");
							}).catch(err => {
								throw "error";
							});
						}).catch(err => {
							throw "error";
						});
					}
					else {
						res.send("SUCCESS: CREATED METER GROUP");
					}
				});
			else
				throw "error";
		}).catch( err => {
			res.send("ERROR: COULD CREATE METER GROUP");
		});
	}
	else {
		res.send("ERROR: COULD NOT UPDATE METER GROUP");
	}
});

router.get("/getMeterGroupsForUser", function (req,res) {
	db.query("SELECT * FROM meter_groups WHERE user_id=?",[req.queryInt('id')]).then( rows => {
		res.send(JSON.stringify(rows));
	}).catch( err => {
		res.send('ERROR: COULD NOT GET METER GROUPS FOR USER');
	});
});

router.get("/getMetersForGroup", function (req,res) {
	if (req.queryString('id')) {
		db.query('SELECT meters.id, meters.name, meter_group_relation.operation FROM meters LEFT JOIN meter_group_relation ON meters.id=meter_group_relation.meter_id WHERE group_id=?',[req.queryString('id')]).then( rows => {
			res.send(JSON.stringify(rows));
		}).catch( err => {
			res.send('ERROR: COULD NOT GET METERS');
		});
	}
	else {
		res.send('ERROR: COULD NOT GET METERS');
	}
});

//Photos
router.get("/listAvailableMedia",function (req,res){
	fs.readdir('./block-media', (e, files)=> {
		if (!e)
			res.send(JSON.stringify(files.filter(file => {
				return file.toLowerCase().indexOf('.png') !== -1 || file.toLowerCase().indexOf('.jpg') !== -1;
			})));
		else
			res.status(400).send("400: "+e);
	});
});

module.exports = (c)=> { cas = c; return router};
