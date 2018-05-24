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
				console.log(obj);
				assert.strictEqual(Array.isArray(obj),true);
				for (j in obj)
					assert.strictEqual(typeof j, 'string');
				assert.strictEqual(obj[0].name, "Test Building");
				done();
			});
		});
	});
	describe("Update Meter Group Data", () => {
		it('Can update a meter group name', done => {
			request.post('http://localhost:3000/api/updateMeterGroup',{form: {name : "Test Group", id : 0}}, (err,res,body) => {
				Assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can create a group', done => {
			request.post('http://localhost:3000/api/updateMeterGroup',{form : {name : "Test Building", user_id : 0}}, (err,res,body) => {
				Assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can change the meters associated with the building', done => {
			request.post('http://localhost:3000/api/updateMeterGroup', {form :{id : 0, meters: [{id:0,operation:0},{id:1,operation:0}]}}, (err,res,body) => {
				Assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});
		it('Can make the group a building', done => {
			request.post('http://localhost:3000/api/updateMeterGroup', {form :{id : 0, building: 1}, (err,res,body) => {
				Assert.strictEqual(body.substr(0,1), "S");
				done();
			});
		});

	});
	describe("Get Block", () => {
		it('Can retrieve the block from an id', done => {
			request.get('http://localhost:3000/api/getBlock?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(obj.name,"Test Block");
				done();
			});
		});

	});
	describe("Get Block Meters", () => {
		it('Can retrieve blocks meters from block id', done => {
			request.get('http://localhost:3000/api/getBlockMeters?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.strictEqual(obj[0], 0);
				done();
			});
		});

	});
	describe("Update Block", () => {
		it('Can create a new block', done => {
			request.post('http://localhost:3000/api/updateBlock', {form:{name : "Test Block", user_id : 0, date_range : "7d", graph_type : 0, description : "Testing table"}},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change a block name', done => {
			request.post('http://localhost:3000/api/updateBlock').form(
				{name : "Test Block", id : 0}
				).on('response',res => {
					Assert.strictEqual(res.substr(0,1), "S");
					done();
			});
		});
		it('Can change the graph type', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{id: 0, graph_type: 1},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the metering points for each meter group', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{meter_group_id : 0, meter_point: 0},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the description', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, description : "Test"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the media link', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, link : "Test"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the range', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, date_range : "1m"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the start date', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, start_date : "5/10/18"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the end date', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, end_date : "5/30/18"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the meter groups', done => {
			request.post('http://localhost:3000/api/updateBlock',{form:{ id: 0, meter_groups : [0]},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
	});
	describe("Get Block For Story", () => {
		it('Can retrieve story from id', done => {
			request.get('http://localhost:3000/api/getBlocksForStory?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.strictEqual(obj[0], 0);
				done();
			});
		});
	});
	describe("Get Stories For User", () => {
		it('Can get story ids for the user', done => {
			request.get('http://localhost:3000/api/getStoriesForUser?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.strictEqual(obj[0], 0);
				done();
			});
		});
	})
	describe("Update Story", () => {
		it('Can change the name of the story', done => {
			request.post('http://localhost:3000/api/updateStory',{form:{ id: 0, name : "Test"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the blocks included in the story', done => {
			request.post('http://localhost:3000/api/updateStory',{form:{ id: 0, blocks : [0]},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
		it('Can change the description of the story', done => {
			request.post('http://localhost:3000/api/updateStory',{form:{ id: 0, description : "Test"},(err,res,body) => {
					Assert.strictEqual(body.substr(0,1), "S");
					done();
			});
		});
	});
	describe("Get Default Meters", () => {
		it('Can get all meters connected to the data collection server', done => {
			request.get('http://localhost:3000/api/getDefaultMeters', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.notStrictEqual(obj[0].name.length, 0);
				done();
			});
		});
	});
	describe("Get Meters for Buildings", () => {
		it('can get meters from building', done => {
			request.get('http://localhost:3000/api/getMetersForBuildings', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.notStrictEqual(obj[0].name.length, 0);
				done();
			});
		});
	});
	describe("Get Meter groups for User", () => {
		it('can get meters for user', done => {
			request.get('http://localhost:3000/api/getMeterGroupsForUser?id=0', (err,res,body) => {
				var obj = JSON.parse(body);
				Assert.strictEqual(Array.isArray(obj),true);
				Assert.notStrictEqual(obj[0], 0);
				done();
			});
		});
	});
	describe("Get Meter Data", () => {
			it('Can use a range from current', done => {
				request.get('http://localhost:3000/api/getMeterData?id=0&range=7d&mpoints=1,2', (err,res,body) => {
					var obj = JSON.parse(body);
					Assert.strictEqual(Array.isArray(obj),true);
					Assert.notStrictEqual(obj[0].name.length, 0);
					done();
				});
			});
		});
	});

after(function(done) {
  app.close(done)
});