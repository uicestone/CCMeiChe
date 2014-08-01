var config = require('config');
var map = require('baidu-map');

module.exports = map(config.get("map"));