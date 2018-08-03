const { Writable } = require('stream');
const helper = require('./helper.js');
const { ScrollSearchStream } = require('../src');
const es5Client = require('./services/elasticsearch5.js');
const es6Client = require('./services/elasticsearch6.js');

function runScenarios(esClient) {
	let indexName;

	beforeAll(async () => {
		const result = await helper.createTestIndex(esClient);
		indexName = result.index;
	});
	afterAll(async () => {
		await helper.deleteTestIndex(esClient, indexName);
	});

	it('Stream should work when 0 records returned', async () => {
		let counter = 0;
		const readStream = new ScrollSearchStream({
			esClient,
			searchOptions: {
				index: indexName,
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
		await new Promise((resolve, reject) => {
			readStream
				.on('error', reject)
				.pipe(testStream)
				.on('finish', () => {
					expect(counter).toStrictEqual(0);
					resolve();
				})
				.on('error', reject);
		});
	});

	it('Should insert 1 record', async () => {
		await helper.populateRecords(esClient, indexName, 1);
	});

	it('Stream should work when 1 records returned', async () => {
		let counter = 0;
		const readStream = new ScrollSearchStream({
			esClient,
			searchOptions: {
				index: indexName,
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
		await new Promise((resolve, reject) => {
			readStream
				.on('error', reject)
				.pipe(testStream)
				.on('finish', () => {
					expect(counter).toBe(1);
					resolve();
				})
				.on('error', reject);
		});
	});

	it('Should insert 99 more records', async () => {
		await helper.populateRecords(esClient, indexName, 99);
	});

	it('Stream should work when 100 records returned', async () => {
		let counter = 0;
		const readStream = new ScrollSearchStream({
			esClient,
			searchOptions: {
				index: indexName,
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
		await new Promise((resolve, reject) => {
			readStream
				.on('error', reject)
				.pipe(testStream)
				.on('finish', () => {
					expect(counter).toBe(100);
					resolve();
				})
				.on('error', reject);
		});
	});

	it('Should insert 900 more records', async () => {
		await helper.populateRecords(esClient, indexName, 900);
	});

	it('Stream should work when 1000 records returned', async () => {
		let counter = 0;
		const readStream = new ScrollSearchStream({
			esClient,
			searchOptions: {
				index: indexName,
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
		await new Promise((resolve, reject) => {
			readStream
				.on('error', reject)
				.pipe(testStream)
				.on('finish', () => {
					expect(counter).toBe(1000);
					resolve();
				})
				.on('error', reject);
		});
	}, 10000);
}

describe('ElasticSearch 5.x', () => {
	runScenarios(es5Client);
});

describe('ElasticSearch 6.x', () => {
	runScenarios(es6Client);
});
