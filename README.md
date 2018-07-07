# ElasticSearch Streams
ElasitcSearch streams for Node.js

## ScrollSearchStream

Uses the scroll API in ElasticSearch to fetch in batches and push down a stream.

**Usage**

```
const { ScrollSearchStream } = require('es-streams');
const searchStream = new ScrollSearchStream({
	esClient,
	searchOptions: {
		index: 'my_index', // Replace with the index(es)
		type: 'my_type', // Replace with the type(s)
		body: {
			// Change to your query
			query: {
				match_all: {},
			},
		},
	},
});
searchStream.pipe(...);
```

**Options**

| Name | Type | Description |
|------|------|-------------|
| `esClient` | `Object` | The connected instance of ElasticSearch. |
| `pageSize` | `Number` | The number of records to accumulate when performing a search from elasticsearch. (default 100) |
| `scrollTimeout` | `String` | The duration ElasticSearch keeps a scroll snapshot between batches. (default `30s`) |
| `searchOptions` | `Object` | Search options for ElasticSearch query. |

**Output**

Each stream consuming the result of the scroll search stream will receive objects like:

```
{
	_index: 'my_index',
	_type: 'my_type',
	_id: 1,
	_score: 1,
	_source: {
		id: 1,
		// The rest of the data
	}
}
```

## LiveSearchStream
Uses the `search_after` option to fetch search batches and push down the stream.

TODO

## IndexStream
Uses the bulk API to index a series of records.

TODO

## UpdateStream
Uses the bulk API to update a series of records.

TODO

## DeleteStream
Uses the bulk API to delete a series of records.

TODO

## BulkStream
Uses the bulk API to do a series of actions on multiple records.

TODO