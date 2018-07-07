const _ = require('lodash');
const uuid = require('uuid');

exports.createTestIndex = async (esClient) => {
	const result = await esClient.indices.create({
		index: 'test',
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

exports.deleteTestIndex = async (esClient) => {
	const result = await esClient.indices.delete({
		index: 'test',
	});
	return result;
};

exports.populateRecords = async (esClient, numberOfRecords) => {
	const actions = [];
	_.times(numberOfRecords, () => {
		const id = uuid.v4();
		actions.push({
			index: {
				_id: id,
				_index: 'test',
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
