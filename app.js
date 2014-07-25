var express = require('express');
var namespace = require('express-namespace');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('./config');

var app = express();
app.namespace("/api/v1", require("./api/v1")(app));

app.listen(config.port, function(){
  console.log("server started at %d",config.port);
});