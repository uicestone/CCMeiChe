var express = require('express');
var namespace = require('express-namespace');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var errorHandler = require('errorhandler');
var config = require('config');

var app = express();


app.use(session({
  store: new RedisStore(config.redis),
  secret: config.session_secret,
  resave:false,
  saveUninitialized:false
}));
app.namespace("/api/v1", require("./api/v1")(app));

app.use(errorHandler());


app.listen(config.get("port"), function(){
  console.log("server started at %d",config.port);
});