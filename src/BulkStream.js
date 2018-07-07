const _ = require('lodash');
const { Writable } = require('stream');

module.exports = class BulkStream extends Writable {
	constructor(options) {
		// Set defaults
		const opts = _.defaults({}, options, {
			esClient: null,
			esIndex: null,
			esType: null,
			objectMode: true,
			esRefresh: true,
			maxAccumulatorSize: 100,
		});
		super(opts);
		this.params = [];
		this.accumulatorSize = 0;
		this.esIndex = opts.esIndex;
		this.esType = opts.esType;
		this.esClient = opts.esClient;
		this.esRefresh = opts.esRefresh;
		this.maxAccumulatorSize = opts.maxAccumulatorSize;
	}

	_write(row, encoding, done) {
		this.params.push(row.action);
		if (row.description) {
			this.params.push(row.description);
		}
		this.accumulatorSize += 1;
		if (this.accumulatorSize === this.maxAccumulatorSize) {
			this.writeToES(done);
		} else {
			done();
		}
	}

	_final(done) {
		this.writeToES(done);
	}

	writeToES(done) {
		if (this.accumulatorSize === 0) {
			done();
			return;
		}
		const { params } = this;
		this.params = [];
		this.accumulatorSize = 0;
		this.esClient.bulk({
			index: this.esIndex,
			type: this.esType,
			refresh: this.esRefresh,
			body: params,
		}, (err, result) => {
			if (err) {
				done(err);
				return;
			}
			if (result.errors) {
				// TODO: Extract error
				done(new Error('Errors in bulk request'));
				return;
			}
			done();
		});
	}
};
