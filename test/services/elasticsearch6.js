const elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
	apiVersion: '6.2',
	host: 'http://elastic:changeme@127.0.0.1:9201',
});
