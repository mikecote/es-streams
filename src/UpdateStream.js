const BulkStream = require('./BulkStream.js');

module.exports = class UpdateStream extends BulkStream {
	_write(row, encoding, done) {
		const bulkRow = {
			action: {
				update: {
					_id: row.id,
				},
			},
			description: {
				doc: row,
			},
		};
		super._write(bulkRow, encoding, done); // eslint-disable-line no-underscore-dangle
	}
};
