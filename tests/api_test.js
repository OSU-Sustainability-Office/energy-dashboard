var assert = require('assert');
var request = require('request');
var app = require('../server.js')

before(function(done) {
  app.start(done)
});


describe("API Calls", () => {
	describe("Get all buildings", () => {
		it("returns all building names with ids", done => {
			request.get('http://localhost:3000/api/getAllBuildings', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.strictEqual(obj[0].name, "Test Group");
				done();
			});
		});
	});
	describe("Update Meter Group Data", () => {
		it('Can update a meter group name', done => {
			request.post({url :'http://localhost:3000/api/updateMeterGroup', json :{name : "Test Group", id : 1}}, (err,res,body) => {
				assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can create a group', done => {
			request.post('http://localhost:3000/api/updateMeterGroup',{json : {name : "Test Building", user_id : 1}}, (err,res,body) => {
				assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can change the meters associated with the building', done => {
			request.post('http://localhost:3000/api/updateMeterGroup', {json :{id : 1, meters: [{id:1,operation:0},{id:1,operation:0}]}}, (err,res,body) => {
				assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can make the group a building', done => {
			request.post('http://localhost:3000/api/updateMeterGroup', {json :{id : 1, building: 1}}, (err,res,body) => {
				assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});

	});
	describe("Get Block", () => {
		it('Can retrieve the block from an id', done => {
			request.get('http://localhost:3000/api/getBlock?id=1', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(obj[0].name,"Test Block");
				done();
			});
		});

	});
	describe("Get Block Meter Groups", () => {
		it('Can retrieve blocks meter groups from block id', done => {
			request.get('http://localhost:3000/api/getBlockMeterGroups?id=1', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.strictEqual(typeof obj[0].id, 'number');
				done();
			});
		});

	});
	describe("Update Block", () => {
		it('Can create a new block', done => {
			request.post('http://localhost:3000/api/updateBlock', {json:{name:"Test",story_id : 1, date_range : "7d", graph_type : 1, description : "Testing table"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change a block name', done => {
			request.post('http://localhost:3000/api/updateBlock', {json:{name : "Test Block", id : 1}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the graph type', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{id: 1, graph_type: 1}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the description', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, descr : "Test"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the media link', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, media : "Test"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the range', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, date_range : "1m"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the start date', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, date_start : "5/10/18"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the end date', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, date_end : "5/30/18"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the meter groups', done => {
			request.post('http://localhost:3000/api/updateBlock',{json:{ id: 1, meter_groups : [{id:1,point:1}]}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
	});
	describe("Get Block For Story", () => {
		it('Can retrieve blocks from story id', done => {
			request.get('http://localhost:3000/api/getBlocksForStory?id=1', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.strictEqual(obj[0].id, 1);
				done();
			});
		});
	});
	describe("Get Stories For User", () => {
		it('Can get story ids for the user', done => {
			request.get('http://localhost:3000/api/getStoriesForUser?id=1', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.strictEqual(obj[0].id, 1);
				done();
			});
		});
	})
	describe("Update Story", () => {
		it('Can change the name of the story', done => {
			request.post('http://localhost:3000/api/updateStory',{json:{ id: 1, name : "Test"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the blocks included in the story', done => {
			request.post('http://localhost:3000/api/updateStory',{json:{ id: 1, blocks : [1]}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the description of the story', done => {
			request.post('http://localhost:3000/api/updateStory',{json:{ id: 1, descr : "Test"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can create a story', done => {
			request.post('http://localhost:3000/api/updateStory',{json:{ user_id: 1, name : "Test"}},(err,res,body) => {
					assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
	});
	describe("Get Default Meters", () => {
		it('Can get all meters connected to the data collection server', done => {
			request.get('http://localhost:3000/api/getDefaultMeters', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.notStrictEqual(obj[0].name.length, 0);
				done();
			});
		});
	});
	describe("Get Meters for Group", () => {
		it('can get meters from building', done => {
			request.get('http://localhost:3000/api/getMetersForGroup?id=1', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.notStrictEqual(obj[0].name.length, 0);
				done();
			});
		});
	});
	describe("Get Meter groups for User", () => {
		it('can get meters for user', done => {
			request.get('http://localhost:3000/api/getMeterGroupsForUser?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				assert.strictEqual(Array.isArray(obj),true);
				assert.notStrictEqual(obj[0], 0);
				done();
			});
		});
	});
	describe("Get Meter Data", () => {
			it('Can use a range from current', done => {
				request.get('http://localhost:3000/api/getMeterData?id=1&date_start=5/1/18&date_end=5/30/18&mpoints=accumulated_real,real_a', (err,res,body) => {
					var obj = JSON.parse(body);
					assert.strictEqual(Array.isArray(obj),true);
					done();
				});
			});
		});
	});

after(function(done) {
  app.close(done)
});