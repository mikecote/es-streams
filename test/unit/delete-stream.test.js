const helper = require('../helper.js');
const { DeleteStream } = require('../../src');

test('Stream should work when 0 records to delete', async () => {
	const readStream = helper.getReadStream(0);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(0);
				resolve();
			});
	});
});

test('Stream should work when 1 record to delete', async () => {
	const readStream = helper.getReadStream(1);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.bulk.mock.calls[0][0];
				expect(firstCallOpts);
				expect(firstCallOpts.index).toBe('test');
				expect(firstCallOpts.type).toBe('type1');
				expect(firstCallOpts.refresh).toStrictEqual(true);
				expect(firstCallOpts.body.length).toBe(1);
				expect(firstCallOpts.body[0].delete).toBeTruthy();
				// eslint-disable-next-line no-underscore-dangle
				expect(firstCallOpts.body[0].delete._id).toBeTruthy();
				resolve();
			});
	});
});

test('Stream should work when 100 records to index', async () => {
	const readStream = helper.getReadStream(100);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.bulk.mock.calls[0][0];
				expect(firstCallOpts);
				expect(firstCallOpts.index).toBe('test');
				expect(firstCallOpts.type).toBe('type1');
				expect(firstCallOpts.refresh).toStrictEqual(true);
				expect(firstCallOpts.body.length).toBe(100);
				resolve();
			});
	});
});

test('Stream should work when 101 records to delete', async () => {
	const readStream = helper.getReadStream(101);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(2);
				const secondCallOpts = esClient.bulk.mock.calls[1][0];
				expect(secondCallOpts);
				expect(secondCallOpts.index).toBe('test');
				expect(secondCallOpts.type).toBe('type1');
				expect(secondCallOpts.refresh).toStrictEqual(true);
				expect(secondCallOpts.body.length).toBe(1);
				resolve();
			});
	});
});

test('Stream should work when 1000 records to delete', async () => {
	const readStream = helper.getReadStream(1000);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(10);
				const tenthCallOpts = esClient.bulk.mock.calls[9][0];
				expect(tenthCallOpts);
				expect(tenthCallOpts.index).toBe('test');
				expect(tenthCallOpts.type).toBe('type1');
				expect(tenthCallOpts.refresh).toStrictEqual(true);
				expect(tenthCallOpts.body.length).toBe(100);
				resolve();
			});
	});
});

test('Stream should return error when bulk fails', async () => {
	const readStream = helper.getReadStream(1);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(new Error('Should fail'));
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', (err) => {
				expect(err.message).toBe('Should fail');
				resolve();
			})
			.on('finish', () => {
				reject();
			});
	});
});

test('Stream should return error when bulk contains errors', async () => {
	const readStream = helper.getReadStream(1);
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, { errors: true });
		}),
	};
	const deleteStream = new DeleteStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(deleteStream)
			.on('error', (err) => {
				expect(err.message).toBe('Errors in bulk request');
				resolve();
			})
			.on('finish', () => {
				reject();
			});
	});
});
