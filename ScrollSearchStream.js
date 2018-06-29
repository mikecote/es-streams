// TODO: Provide top result info to each stream element

const _ = require('lodash');
const { Readable } = require('stream');

module.exports = class ScrollStream extends Readable {
	constructor(options) {
		// Set defaults
		const opts = _.defaults({}, options, {
			body: {},
			esClient: null,
			objectMode: true,
			scrollTimeout: '30s',
		});
		super(opts);
		// Set local variables
		this._pointer = 0;
		this._scrollId = null;
		this._reading = false;
		this._searchOptions = opts.searchOptions;
		this._forceClose = false;
		this._esClient = opts.esClient;
		this._scrollTimeout = opts.scrollTimeout;
	}
	_read() {
		if (this._reading) return;
		this._fetchPage();
	}
	_fetchPage() {
		this._reading = true;
		if (this._scrollId) {
			// Continue scrolling
			this._esClient.scroll({
				scroll: this._scrollTimeout,
				scroll_id: this._scrollId,
			}, this._fetchPageCallbackHandler.bind(this));
		} else {
			// Start new scroll
			const searchOpts = {
				...this._searchOptions,
				scroll: this._scrollTimeout,
			};
			this._esClient.search(searchOpts, this._fetchPageCallbackHandler.bind(this));
		}
	}
	_fetchPageCallbackHandler(err, result) {
		if (err) {
			this._reading = false;
			this.emit('error', err);
			return;
		}
		let fetchMore = true;
		this._scrollId = result._scroll_id;
		_.each(result.hits.hits, (hit) => {
			fetchMore = this.push(hit);
			this._pointer++;
		});
		this._reading = false;
		if (result.hits.total === this._pointer || this._forceClose) {
			// Trigger an async clearScroll fo rthe current _scrollID
			this._esClient.clearScroll({ scrollId: this._scrollId }, _.noop);
			// End
			this._counter = 0;
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
