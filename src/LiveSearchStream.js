const _ = require('lodash');
const { Readable } = require('stream');

module.exports = class LiveSearchStream extends Readable {
	constructor(options) {
		// Set defaults
		const opts = _.defaults({}, options, {
			pageSize: 100,
			esClient: null,
			objectMode: true,
			searchOptions: null,
		});
		super(opts);
		// Set local variables
		this.counter = 0;
		this.pointer = null;
		this.reading = false;
		this.forceClose = false;
		this.esClient = opts.esClient;
		this.searchOptions = opts.searchOptions;
		this.searchOptions.body.size = opts.pageSize;
		if (!this.searchOptions.body.sort) {
			this.searchOptions.body.sort = [{ id: 'asc' }];
		}
	}

	_read() {
		if (!this.reading) {
			this.fetchPage();
		}
	}

	fetchPage() {
		this.reading = true;
		const body = {
			...this.searchOptions,
			body: {
				...this.searchOptions.body,
				search_after: this.pointer || undefined,
			},
		};
		this.esClient.search(body, this.fetchPageCallbackHandler.bind(this));
	}

	fetchPageCallbackHandler(err, result) {
		if (err) {
			this.reading = false;
			this.emit('error', err);
			return;
		}
		let fetchMore = true;
		_.each(result.hits.hits, (hit) => {
			fetchMore = this.push(hit);
			this.pointer = hit.sort;
			this.counter = this.counter + 1;
		});
		this.reading = false;
		if (result.hits.total === this.counter || this.forceClose) {
			// End
			this.forceClose = false;
			this.push(null);
		} else if (fetchMore) {
			this.fetchPage();
		}
	}

	close() {
		this.forceClose = true;
	}
};
