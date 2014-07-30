var express = require('express');
var namespace = require('express-namespace');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var passport = require('passport');
var config = require('config');

var app = express();

require('./auth');

app.use(session({
  store: new RedisStore(config.redis),
  secret: config.session_secret,
  cookie: { maxAge : 3600000 },
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'))
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req,res){
  res.sendfile("login.html");
});

app.get('/', function(req,res){
  if(!req.isAuthenticated()){
    return res.redirect("/login");
  }
  res.sendfile("index.html");
});

app.get('/order', function(){
  res.sendfile("order.html");
});

app.namespace("/api/v1", require("./api/v1")(app));

app.use(errorHandler());


app.listen(config.get("port"), function () {
  console.log("server started at %d", config.port);
});