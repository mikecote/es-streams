const _ = require('lodash');
const uuid = require('uuid');

exports.createTestIndex = (esClient, done) => {
	esClient.indices.create({
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
	}, done);
};

exports.deleteTestIndex = (esClient, done) => {
	esClient.indices.delete({
		index: 'test',
	}, done);
};

exports.populateRecords = (esClient, numberOfRecords, done) => {
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
	esClient.bulk({
		refresh: true,
		body: actions,
	}, (err, resp) => {
		if (err) {
			done(err);
			return;
		}
		if (resp.errors === true) {
			done(new Error('Failed to index all records'));
			return;
		}
		done(null, resp);
	});
};
