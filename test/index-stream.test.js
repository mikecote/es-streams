const helper = require('./helper.js');
const { IndexStream } = require('../src');
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

	test('Stream work when 0 records to index', async () => {
		const numOfRecords = 1;
		const readStream = helper.getReadStream(numOfRecords);
		const indexStream = new IndexStream({
			esClient,
			esIndex: indexName,
			esType: 'type1',
		});
		await new Promise((resolve, reject) => {
			readStream
				.pipe(indexStream)
				.on('error', reject)
				.on('finish', resolve);
		});
	});

	test('Stream should work when 1 record to index', async () => {
		const numOfRecords = 1;
		const readStream = helper.getReadStream(numOfRecords);
		const indexStream = new IndexStream({
			esClient,
			esIndex: indexName,
			esType: 'type1',
		});
		await new Promise((resolve, reject) => {
			readStream
				.pipe(indexStream)
				.on('error', reject)
				.on('finish', resolve);
		});
	});

	test('Stream should work when 100 records to index', async () => {
		const numOfRecords = 100;
		const readStream = helper.getReadStream(numOfRecords);
		const indexStream = new IndexStream({
			esClient,
			esIndex: indexName,
			esType: 'type1',
		});
		await new Promise((resolve, reject) => {
			readStream
				.pipe(indexStream)
				.on('error', reject)
				.on('finish', resolve);
		});
	});

	test('Stream should work when 101 records to index', async () => {
		const numOfRecords = 101;
		const readStream = helper.getReadStream(numOfRecords);
		const indexStream = new IndexStream({
			esClient,
			esIndex: indexName,
			esType: 'type1',
		});
		await new Promise((resolve, reject) => {
			readStream
				.pipe(indexStream)
				.on('error', reject)
				.on('finish', resolve);
		});
	});

	test('Stream should work when 1000 records to index', async () => {
		const numOfRecords = 1000;
		const readStream = helper.getReadStream(numOfRecords);
		const indexStream = new IndexStream({
			esClient,
			esIndex: indexName,
			esType: 'type1',
		});
		await new Promise((resolve, reject) => {
			readStream
				.pipe(indexStream)
				.on('error', reject)
				.on('finish', resolve);
		});
	});
}

describe('ElasticSearch 5.x', () => {
	runScenarios(es5Client);
});

describe('ElasticSearch 6.x', () => {
	runScenarios(es6Client);
});
