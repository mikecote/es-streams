const _ = require('lodash');
const { Readable } = require('stream');

module.exports = class ScrollStream extends Readable {
	constructor(options) {
		// Set defaults
		const opts = _.defaults({}, options, {
			pageSize: 100,
			esClient: null,
			objectMode: true,
			searchOptions: null,
			scrollTimeout: '30s',
		});
		super(opts);
		// Set local variables
		this.pointer = 0;
		this.scrollId = null;
		this.reading = false;
		this.searchOptions = opts.searchOptions;
		this.forceClose = false;
		this.esClient = opts.esClient;
		this.scrollTimeout = opts.scrollTimeout;
		this.searchOptions.body.size = opts.pageSize;
	}

	_read() {
		if (!this.reading) {
			this.fetchPage();
		}
	}

	fetchPage() {
		this.reading = true;
		if (this.scrollId) {
			// Continue scrolling
			this.esClient.scroll({
				scroll: this.scrollTimeout,
				scroll_id: this.scrollId,
			}, this.fetchPageCallbackHandler.bind(this));
		} else {
			// Start new scroll
			const searchOpts = {
				...this.searchOptions,
				scroll: this.scrollTimeout,
			};
			this.esClient.search(searchOpts, this.fetchPageCallbackHandler.bind(this));
		}
	}

	fetchPageCallbackHandler(err, result) {
		if (err) {
			this.reading = false;
			this.emit('error', err);
			return;
		}
		let fetchMore = true;
		this.scrollId = result._scroll_id; // eslint-disable-line no-underscore-dangle
		_.each(result.hits.hits, (hit) => {
			fetchMore = this.push(hit);
			this.pointer = this.pointer + 1;
		});
		this.reading = false;
		if (result.hits.total === this.pointer || this.forceClose) {
			// Trigger an async clearScroll for the current scrollId, if an error happens,
			// scrollTimeout will ensure the scroll goes away
			this.esClient.clearScroll({ scrollId: this.scrollId }, _.noop);
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
