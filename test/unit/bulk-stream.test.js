const { Readable, Transform } = require('stream');
const helper = require('../helper.js');
const { BulkStream } = require('../../src');

test('Stream should work when 0 records to process', async () => {
	const readStream = new Readable({ objectMode: true });
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const bulkStream = new BulkStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(bulkStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(0);
				resolve();
			});
		readStream.push(null);
	});
});

test('Stream should work when index, update and delete actions are given', async () => {
	const readStream = new Readable({ objectMode: true });
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const bulkStream = new BulkStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(bulkStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.bulk.mock.calls[0][0];
				expect(firstCallOpts);
				expect(firstCallOpts.index).toBe('test');
				expect(firstCallOpts.type).toBe('type1');
				expect(firstCallOpts.refresh).toStrictEqual(true);
				expect(firstCallOpts.body.length).toBe(5);
				expect(firstCallOpts.body[0].index).toBeTruthy();
				// eslint-disable-next-line no-underscore-dangle
				expect(firstCallOpts.body[0].index._id).toBe(1);
				expect(firstCallOpts.body[1].id).toBe(1);
				expect(firstCallOpts.body[2].update).toBeTruthy();
				// eslint-disable-next-line no-underscore-dangle
				expect(firstCallOpts.body[2].update._id).toBe(1);
				expect(firstCallOpts.body[3].doc).toBeTruthy();
				expect(firstCallOpts.body[3].doc.id).toBe(1);
				expect(firstCallOpts.body[4].delete).toBeTruthy();
				// eslint-disable-next-line no-underscore-dangle
				expect(firstCallOpts.body[4].delete._id).toBe(1);
				resolve();
			});
		readStream.push({
			action: {
				index: {
					_id: 1,
				},
			},
			description: {
				id: 1,
			},
		});
		readStream.push({
			action: {
				update: {
					_id: 1,
				},
			},
			description: {
				doc: {
					id: 1,
				},
			},
		});
		readStream.push({
			action: {
				delete: {
					_id: 1,
				},
			},
		});
		readStream.push(null);
	});
});

test('Stream should call bulk after 100 objects by default', async () => {
	const readStream = helper.getReadStream(101);
	const transformStream = new Transform({
		objectMode: true,
		transform(row, encoding, done) {
			done(null, {
				action: {
					index: {
						_id: row.id,
					},
				},
				description: row,
			});
		},
	});
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, {});
		}),
	};
	const bulkStream = new BulkStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(transformStream)
			.pipe(bulkStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.bulk).toHaveBeenCalledTimes(2);
				expect(esClient.bulk.mock.calls[0][0].body.length).toBe(200);
				expect(esClient.bulk.mock.calls[1][0].body.length).toBe(2);
				resolve();
			});
	});
});

test('Stream should return error when bulk fails', async () => {
	const readStream = Readable({ objectMode: true });
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(new Error('Should fail'));
		}),
	};
	const bulkStream = new BulkStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(bulkStream)
			.on('error', (err) => {
				expect(err.message).toBe('Should fail');
				resolve();
			})
			.on('finish', () => {
				reject();
			});
		readStream.push({
			action: {
				index: {
					_id: 1,
				},
			},
			description: {
				id: 1,
			},
		});
		readStream.push(null);
	});
});

test('Stream should return error when bulk contains errors', async () => {
	const readStream = Readable({ objectMode: true });
	const esClient = {
		bulk: jest.fn((opts, done) => {
			done(null, { errors: true });
		}),
	};
	const bulkStream = new BulkStream({
		esClient,
		esIndex: 'test',
		esType: 'type1',
	});
	await new Promise((resolve, reject) => {
		readStream
			.pipe(bulkStream)
			.on('error', (err) => {
				expect(err.message).toBe('Errors in bulk request');
				resolve();
			})
			.on('finish', () => {
				reject();
			});
		readStream.push({
			action: {
				index: {
					_id: 1,
				},
			},
			description: {
				id: 1,
			},
		});
		readStream.push(null);
	});
});
