# ElasticSearch Streams
ElasticSearch streams for Node.js

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

**Usage**

```
const { LiveSearchStream } = require('es-streams');
const searchStream = new LiveSearchStream({
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
| `searchOptions` | `Object` | Search options for ElasticSearch query. |

**Output**

Each stream consuming the result of the live search stream will receive objects like:

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

## IndexStream
Uses the bulk API to index a series of records.

**Usage**

```
const { IndexStream } = require('es-streams');
const indexStream = new IndexStream({
	esClient,
	esIndex: 'my_index', // Replace with your index
	esType: 'my_type', // Replace with your type
});
readStream.pipe(indexStream);
```

**Options**

| Name | Type | Description |
|------|------|-------------|
| `esClient` | `Object` | The connected instance of ElasticSearch. |
| `esIndex` | `String` | The index to index records into. |
| `esType` | `String` | The type to index records into. |
| `esRefresh` | `Boolean` | Indicator to refresh the index after each bulk request. (default `true`) |
| `maxAccumulatorSize` | `Boolean` | The maximum number of records to accumulate before calling the bulk API. (default `100`) |

**Input**

The stream expects input objects like:

```
{
	id: 1,
	// The rest of the data
}
```

## UpdateStream
Uses the bulk API to update a series of records.

**Usage**

```
const { UpdateStream } = require('es-streams');
const updateStream = new UpdateStream({
	esClient,
	esIndex: 'my_index', // Replace with your index
	esType: 'my_type', // Replace with your type
});
readStream.pipe(updateStream);
```

**Options**

| Name | Type | Description |
|------|------|-------------|
| `esClient` | `Object` | The connected instance of ElasticSearch. |
| `esIndex` | `String` | The index to update records into. |
| `esType` | `String` | The type to update records into. |
| `esRefresh` | `Boolean` | Indicator to refresh the index after each bulk request. (default `true`) |
| `maxAccumulatorSize` | `Boolean` | The maximum number of records to accumulate before calling the bulk API. (default `100`) |

**Input**

The stream expects input objects like:

```
{
	id: 1,
	// The rest of the data
}
```

## DeleteStream
Uses the bulk API to delete a series of records.

**Usage**

```
const { DeleteStream } = require('es-streams');
const deleteStream = new DeleteStream({
	esClient,
	esIndex: 'my_index', // Replace with your index
	esType: 'my_type', // Replace with your type
});
readStream.pipe(deleteStream);
```

**Options**

| Name | Type | Description |
|------|------|-------------|
| `esClient` | `Object` | The connected instance of ElasticSearch. |
| `esIndex` | `String` | The index to delete records from. |
| `esType` | `String` | The type to delete records from. |
| `esRefresh` | `Boolean` | Indicator to refresh the index after each bulk request. (default `true`) |
| `maxAccumulatorSize` | `Boolean` | The maximum number of records to accumulate before calling the bulk API. (default `100`) |

**Input**

The stream expects input objects like:

```
{
	id: 1,
	// Rest of data not required
}
```

## BulkStream
Uses the bulk API to do a series of actions on multiple records.

**Usage**

```
const { BulkStream } = require('es-streams');
const bulkStream = new BulkStream({
	esClient,
	esIndex: 'my_index', // Replace with your index
	esType: 'my_type', // Replace with your type
});
readStream.pipe(bulkStream);
```

**Options**

| Name | Type | Description |
|------|------|-------------|
| `esClient` | `Object` | The connected instance of ElasticSearch. |
| `esIndex` | `String` | The default index to apply action on each record unless provided with the data. |
| `esType` | `String` | The default type to apply action on each records unless provided with the data. |
| `esRefresh` | `Boolean` | Indicator to refresh the index after each bulk request. (default `true`) |
| `maxAccumulatorSize` | `Boolean` | The maximum number of records to accumulate before calling the bulk API. (default `100`) |

**Input**

The stream expects input objects like:

index:

```
{
	action: {
		index: {
			_id: 1,
		},
	},
	description: {
		id: 1,
		// Rest of data not required
	},
}
```

update:

```
{
	action: {
		update: {
			_id: 1,
		},
	},
	description: {
		id: 1,
		// Rest of data not required
	},
}
```

delete:

```
{
	action: {
		delete: {
			_id: 1,
		},
	},
}
```
