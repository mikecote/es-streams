const BulkStream = require('./BulkStream.js');

module.exports = class DeleteStream extends BulkStream {
	_write(row, encoding, done) {
		const bulkRow = {
			action: {
				delete: {
					_id: row.id,
				},
			},
		};
		super._write(bulkRow, encoding, done); // eslint-disable-line no-underscore-dangle
	}
};
