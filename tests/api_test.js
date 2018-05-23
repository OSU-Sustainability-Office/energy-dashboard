var assert = require('assert');


describe("API Calls", () => {
	describe("Get Building Data", () => {
		it('Should need a date', () => {

		});
		it('Can use a range from current', () => {

		});
		it('Can specify a range and a start', () => {

		});
		it('Can specify a range and a end', () => {

		});
		it('Can use a name', () => {

		});
		it('needs an id or name', () => {

		});
		it('can have multiple metering points', () => {

		});
		it('needs a metering point', () => {

		});

	});
	describe("Update Building Data", () => {
		it('Can update a buildings name', () => {

		});
		it('Can create a building', () => {

		});
		it('Can change the meters associated with the building', () => {

		});

	});
	describe("Get Block", () => {
		it('Can retrieve the block from an id', () => {

		});

	});
	describe("Update Block", () => {
		it('Can create a new block', () => {

		});
		it('Can change a block name', () => {

		});
		it('Can change the graph type', () => {

		});
		it('Can change the metering points for each building', () => {

		});
		it('Can change the text', () => {

		});
		it('Can change the media link', () => {

		});
		it('Can change the range', () => {

		});
		it('Can change the start date', () => {

		});
		it('Can change the end date', () => {

		});
		it('Can change the buildings', () => {

		});
	});
	describe("Get Block For Story", () => {
		it('Can retrieve story from id', () => {

		});
	});
	describe("Get Stories For User", () => {
		it('Can get story ids for the user', () => {

		});
	})
	describe("Update Story", () => {
		it('Can change the name of the story', () => {

		});
		it('Can change the blocks included in the story', () => {

		});
		it('Can change the description of the story', () => {

		});
	});
	describe("Get Default Meters" () => {
		it('Can get all meters connected to the data collection server', () => {

		});
	});
});