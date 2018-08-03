const _ = require('lodash');
const uuid = require('uuid');
const { Readable, Writable } = require('stream');

exports.createTestIndex = async (esClient) => {
	const result = await esClient.indices.create({
		index: uuid.v4(),
		body: {
			settings: {
				number_of_shards: 1,
				number_of_replicas: 0,
			},
			mappings: {
				type1: {
					properties: {
						id: { type: 'keyword' },
					},
				},
			},
		},
	});
	return result;
};

exports.deleteTestIndex = async (esClient, indexName) => {
	const result = await esClient.indices.delete({
		index: indexName,
	});
	return result;
};

exports.populateRecords = async (esClient, indexName, numberOfRecords) => {
	const actions = [];
	_.times(numberOfRecords, () => {
		const id = uuid.v4();
		actions.push({
			index: {
				_id: id,
				_index: indexName,
				_type: 'type1',
			},
		});
		actions.push({
			id,
			field1: uuid.v4(),
		});
	});
	const result = await esClient.bulk({
		refresh: true,
		body: actions,
	});
	if (result.errors === true) {
		return Promise.reject(new Error('Failed to index all records'));
	}
	return result;
};

exports.getReadStream = (numOfRecords) => {
	let counter = 0;
	return new Readable({
		objectMode: true,
		read() {
			if (counter === numOfRecords) {
				this.push(null);
				return;
			}
			this.push({
				id: uuid.v4(),
				field2: uuid.v4(),
			});
			counter += 1;
		},
	});
};

exports.getAccumulatorStream = () => {
	const rows = [];
	const writeStream = new Writable({
		objectMode: true,
		write(row, encoding, done) {
			rows.push(row);
			setTimeout(done, 0);
		},
	});
	writeStream.getAccumulatedRows = () => rows;
	return writeStream;
};
