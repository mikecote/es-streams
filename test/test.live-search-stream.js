const assert = require('assert');
const { Writable } = require('stream');
const helper = require('./helper.js');
const es5Client = require('./services/elasticsearch5.js');
const es6Client = require('./services/elasticsearch6.js');
const LiveSearchStream = require('../src/LiveSearchStream.js');

describe(__filename, () => {
	function runScenarios(esClient) {
		before((done) => {
			helper.createTestIndex(esClient, done);
		});

		it('Stream should work when 0 records returned', (done) => {
			let counter = 0;
			const readStream = new LiveSearchStream({
				esClient,
				searchOptions: {
					index: 'test',
					type: 'type1',
					body: {
						query: {
							match_all: {},
						},
					},
				},
			});
			const testStream = new Writable({
				objectMode: true,
				write(row, encoding, next) {
					counter += 1;
					next(null, row);
				},
			});
			readStream
				.on('error', done)
				.pipe(testStream)
				.on('finish', () => {
					assert.strictEqual(counter, 0);
					done();
				})
				.on('error', done);
		});

		it('Should insert 1 record', (done) => {
			helper.populateRecords(esClient, 1, done);
		});

		it('Stream should work when 1 records returned', (done) => {
			let counter = 0;
			const readStream = new LiveSearchStream({
				esClient,
				searchOptions: {
					index: 'test',
					type: 'type1',
					body: {
						query: {
							match_all: {},
						},
					},
				},
			});
			const testStream = new Writable({
				objectMode: true,
				write(row, encoding, next) {
					counter += 1;
					next(null, row);
				},
			});
			readStream
				.on('error', done)
				.pipe(testStream)
				.on('finish', () => {
					assert.strictEqual(counter, 1);
					done();
				})
				.on('error', done);
		});

		it('Should insert 99 more records', (done) => {
			helper.populateRecords(esClient, 99, done);
		});

		it('Stream should work when 100 records returned', (done) => {
			let counter = 0;
			const readStream = new LiveSearchStream({
				esClient,
				searchOptions: {
					index: 'test',
					type: 'type1',
					body: {
						query: {
							match_all: {},
						},
					},
				},
			});
			const testStream = new Writable({
				objectMode: true,
				write(row, encoding, next) {
					counter += 1;
					next(null, row);
				},
			});
			readStream
				.on('error', done)
				.pipe(testStream)
				.on('finish', () => {
					assert.strictEqual(counter, 100);
					done();
				})
				.on('error', done);
		});

		it('Should insert 900 more records', (done) => {
			helper.populateRecords(esClient, 900, done);
		});

		it('Stream should work when 1000 records returned', function run(done) {
			this.timeout(10000);
			let counter = 0;
			const readStream = new LiveSearchStream({
				esClient,
				searchOptions: {
					index: 'test',
					type: 'type1',
					body: {
						query: {
							match_all: {},
						},
					},
				},
			});
			const testStream = new Writable({
				objectMode: true,
				write(row, encoding, next) {
					counter += 1;
					next(null, row);
				},
			});
			readStream
				.on('error', done)
				.pipe(testStream)
				.on('finish', () => {
					assert.strictEqual(counter, 1000);
					done();
				})
				.on('error', done);
		});

		after((done) => {
			helper.deleteTestIndex(esClient, done);
		});
	}

	describe('ElasticSearch 5.x', () => {
		runScenarios(es5Client);
	});

	describe('ElasticSearch 6.x', () => {
		runScenarios(es6Client);
	});
});
