const BulkStream = require('./BulkStream.js');

module.exports = class IndexStream extends BulkStream {
	_write(row, encoding, done) {
		const bulkRow = {
			action: {
				index: {
					_id: row.id,
				},
			},
			description: row,
		};
		super._write(bulkRow, encoding, done); // eslint-disable-line no-underscore-dangle
	}
};
