// https://www.elastic.co/guide/en/elasticsearch/reference/master/search-request-search-after.html

// TODO: Enforce sort

const _ = require('lodash');
const { Readable } = require('stream');

module.exports = class LiveSearchStream extends Readable {
	constructor(options) {
		// Set defaults
		const opts = _.defaults({}, options, {
			esClient: null,
			objectMode: true,
			searchOptions: null,
		});
		super(opts);
		// Set local variables
		this._counter = 0;
		this._pointer = null;
		this._reading = false;
		this._searchOptions = opts.searchOptions;
		this._forceClose = false;
		this._esClient = opts.esClient;
	}
	_read() {
		if (this._reading) return;
		this._fetchPage();
	}
	_fetchPage() {
		this._reading = true;
		if (this._pointer) {
			// Search after pointer
			const body = {
				...this._searchOptions,
				body: {
					...this._searchOptions.body,
					search_after: this._pointer,
				}
			};
			this._esClient.search(body, this._fetchPageCallbackHandler.bind(this));
		} else {
			// Start new search
			this._esClient.search(this._searchOptions, this._fetchPageCallbackHandler.bind(this));
		}
	}
	_fetchPageCallbackHandler(err, result) {
		if (err) {
			this._reading = false;
			this.emit('error', err);
			return;
		}
		let fetchMore = true;
		_.each(result.hits.hits, (hit) => {
			fetchMore = this.push(hit);
			this._pointer = hit.sort;
			this._counter++;
		});
		this._reading = false;
		if (result.hits.total === this._counter || this._forceClose) {
			// End
			this._forceClose = false;
			this.push(null);
		} else if (fetchMore) {
			this._fetchPage();
		}
	}
	close() {
		this._forceClose = true;
	}
};
