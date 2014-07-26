var redis = require('redis');

var config = require('config').get('redis');

module.exports = redis.createClient(config.port, config.address);