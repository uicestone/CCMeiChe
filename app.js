var express = require('express');
var namespace = require('express-namespace');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var passport = require('passport');
var config = require('config');
var wechat = require('wechat');

var app = express();

require('./auth');

app.set('view engine', 'jade');
app.set('views', __dirname + '/public/jade');

app.use(session({
  store: new RedisStore(config.redis),
  secret: config.session_secret,
  cookie: { maxAge : 60 * 24 * 60 * 60 * 1000 },
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

app.use(function(req,res,next){
  res.locals.config = {
    qiniu_host: config.qiniu.host
  };
  next();
});

app.get('/login', function(req,res){
  res.render("login",{
    id:"login",
    title: "ccmeiche login"
  });
});

app.get('/', function(req,res){
  if(!req.isAuthenticated()){
    return res.redirect("/login");
  }
  res.render("index",{
    id: "home",
    title: "ccmeiche home",
    phone: req.user.phone
  });
});

app.namespace("/api/v1", require("./api/v1")(app));
app.namespace("/wechat", require("./wechat")(app));

app.use(errorHandler());


app.listen(config.get("port"), function () {
  console.log("server started at %d", config.port);
});