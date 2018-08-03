const helper = require('../helper.js');
const { LiveSearchStream } = require('../../src');

test('Stream should work when 0 results found', async () => {
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(null, {
					hits: {
						total: 0,
						hits: [],
					},
				});
			}, 0);
		}),
	};
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
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.on('error', reject)
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.search).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.search.mock.calls[0][0];
				expect(firstCallOpts);
				expect(firstCallOpts.index).toBe('test');
				expect(firstCallOpts.type).toBe('type1');
				expect(firstCallOpts.body).toBeTruthy();
				expect(firstCallOpts.body.size).toBe(100);
				expect(firstCallOpts.body.sort).toEqual([{ id: 'asc' }]);
				const results = writeStream.getAccumulatedRows();
				expect(results.length).toBe(0);
				resolve();
			});
	});
});

test('Stream should work when results found', async () => {
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(null, {
					hits: {
						total: 1,
						hits: [{
							_id: 1,
						}],
					},
				});
			}, 0);
		}),
	};
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
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.on('error', reject)
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.search).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.search.mock.calls[0][0];
				expect(firstCallOpts);
				expect(firstCallOpts.index).toBe('test');
				expect(firstCallOpts.type).toBe('type1');
				expect(firstCallOpts.body).toBeTruthy();
				expect(firstCallOpts.body.size).toBe(100);
				expect(firstCallOpts.body.sort).toEqual([{ id: 'asc' }]);
				const results = writeStream.getAccumulatedRows();
				expect(results.length).toBe(1);
				expect(results[0]).toEqual({ _id: 1 });
				resolve();
			});
	});
});

test('Stream should work when multiple pages are fetched', async () => {
	let callCount = 0;
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(null, {
					hits: {
						total: 2,
						hits: [{
							_id: (callCount += 1),
						}],
					},
				});
			}, 0);
		}),
	};
	const readStream = new LiveSearchStream({
		esClient,
		pageSize: 1,
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
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.on('error', reject)
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.search).toHaveBeenCalledTimes(2);
				const secondCallOpts = esClient.search.mock.calls[1][0];
				expect(secondCallOpts);
				expect(secondCallOpts.index).toBe('test');
				expect(secondCallOpts.type).toBe('type1');
				expect(secondCallOpts.body).toBeTruthy();
				expect(secondCallOpts.body.size).toBe(1);
				expect(secondCallOpts.body.sort).toEqual([{ id: 'asc' }]);
				const results = writeStream.getAccumulatedRows();
				expect(results.length).toBe(2);
				expect(results[0]).toEqual({ _id: 1 });
				expect(results[1]).toEqual({ _id: 2 });
				resolve();
			});
	});
});

test('Stream should return error when search fails', async () => {
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(new Error('Should fail'));
			}, 0);
		}),
	};
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
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.on('error', (err) => {
				expect(err.message).toBe('Should fail');
				resolve();
			})
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				reject();
			});
	});
});

test('Closing stream early should work', async () => {
	let callCount = 0;
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(null, {
					hits: {
						total: 10,
						hits: [{
							_id: (callCount += 1),
						}],
					},
				});
			}, 0);
		}),
	};
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
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.search).toHaveBeenCalledTimes(1);
				resolve();
			});
		readStream.close();
	});
});

test('Stream should take custom sort', async () => {
	const esClient = {
		search: jest.fn((opts, done) => {
			setTimeout(() => {
				done(null, {
					hits: {
						total: 0,
						hits: [],
					},
				});
			}, 0);
		}),
	};
	const readStream = new LiveSearchStream({
		esClient,
		searchOptions: {
			index: 'test',
			type: 'type1',
			body: {
				query: {
					match_all: {},
				},
				sort: [{ id: 'desc' }],
			},
		},
	});
	const writeStream = helper.getAccumulatorStream();
	await new Promise((resolve, reject) => {
		readStream
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', () => {
				expect(esClient.search).toHaveBeenCalledTimes(1);
				const firstCallOpts = esClient.search.mock.calls[0][0];
				expect(firstCallOpts.body.sort).toEqual([{ id: 'desc' }]);
				resolve();
			});
	});
});
