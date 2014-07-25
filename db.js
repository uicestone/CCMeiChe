var mongo = require("mongoskin");
var config = require("./config");

var dbcfg = config.db;
module.exports = mongo.db('mongodb://'
    + ((dbcfg.user && dbcfg.password) ? (dbcfg.user + ':' + dbcfg.password + '@' ) : '')
    + dbcfg.url
    + "?auto_reconnect=true");