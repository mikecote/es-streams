const helper = require('./helper.js');
const { IndexStream } = require('../src');
const es5Client = require('./services/elasticsearch5.js');
const es6Client = require('./services/elasticsearch6.js');

describe(__filename, () => {
	function runScenarios(esClient) {
		before(async () => {
			await helper.createTestIndex(esClient);
		});
		after(async () => {
			await helper.deleteTestIndex(esClient);
		});

		it('Stream work when 0 records to index', (done) => {
			const numOfRecords = 1;
			const readStream = helper.getReadStream(numOfRecords);
			const indexStream = new IndexStream({
				esClient,
				esIndex: 'test',
				esType: 'type1',
			});
			readStream
				.pipe(indexStream)
				.on('error', done)
				.on('finish', () => done());
		});

		it('Stream should work when 1 record to index', (done) => {
			const numOfRecords = 1;
			const readStream = helper.getReadStream(numOfRecords);
			const indexStream = new IndexStream({
				esClient,
				esIndex: 'test',
				esType: 'type1',
			});
			readStream
				.pipe(indexStream)
				.on('error', done)
				.on('finish', () => done());
		});

		it('Stream should work when 100 records to index', (done) => {
			const numOfRecords = 100;
			const readStream = helper.getReadStream(numOfRecords);
			const indexStream = new IndexStream({
				esClient,
				esIndex: 'test',
				esType: 'type1',
			});
			readStream
				.pipe(indexStream)
				.on('error', done)
				.on('finish', () => done());
		});

		it('Stream should work when 101 records to index', (done) => {
			const numOfRecords = 101;
			const readStream = helper.getReadStream(numOfRecords);
			const indexStream = new IndexStream({
				esClient,
				esIndex: 'test',
				esType: 'type1',
			});
			readStream
				.pipe(indexStream)
				.on('error', done)
				.on('finish', () => done());
		});

		it('Stream should work when 1000 records to index', (done) => {
			const numOfRecords = 1000;
			const readStream = helper.getReadStream(numOfRecords);
			const indexStream = new IndexStream({
				esClient,
				esIndex: 'test',
				esType: 'type1',
			});
			readStream
				.pipe(indexStream)
				.on('error', done)
				.on('finish', () => done());
		});
	}

	describe('ElasticSearch 5.x', () => {
		runScenarios(es5Client);
	});

	describe('ElasticSearch 6.x', () => {
		runScenarios(es6Client);
	});
});
