const elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
	apiVersion: '5.6',
	host: 'http://elastic:changeme@127.0.0.1:9200',
});
