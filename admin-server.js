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
var uuid = require('uuid').v1;
var routes = require('./admin/routes');
var apis = require('./admin/apis');
require('colors');
var app = express();

require('./admin/passport-init');

app.set('view engine', 'jade');
app.set('views', __dirname + '/admin/views');
app.use(function(req,res,next){
  req.reqid = uuid();
  next();
});
app.use(session({
  store: new RedisStore(config.redis),
  secret: config.session_secret,
  cookie: { maxAge : 60 * 24 * 60 * 60 * 1000 },
  resave: true,
  unset: "destroy",
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req,res,next){
  console.log("admin",req.method,req.url);
  if(req.method == "POST"){
    console.log(JSON.stringify(req.body,null,2));
  }
  next();
});
app.use(express.static(__dirname + '/admin/public'))
app.use(passport.initialize());
app.use(passport.session());

app.get('/', routes.auth, routes.worker);
app.get('/worker', routes.auth, routes.worker);
app.get('/user', routes.auth, routes.user);
app.get('/order', routes.auth, routes.order);
app.get('/promo-qrcode', routes.auth, routes.promo_qrcode);
app.get('/serveregion', routes.auth, routes.serveregion);

app.get('/api/worker', apis.auth, apis.worker.list);
app.post('/api/worker', apis.auth, apis.worker.create);
app.post('/api/worker/clear', apis.auth, apis.worker.clear);
app.get('/api/user', apis.auth, apis.user.list);
app.post('/api/user/clear', apis.auth, apis.user.clear);
app.get('/api/order', apis.auth, apis.order.list);
app.post('/api/qrcode/add', apis.auth, apis.qrcode.add);
app.post('/api/order/cancel', apis.auth, apis.order.cancel);
app.post('/api/order/clear', apis.auth, apis.order.clear);


app.get('/logout', routes.logout);
app.get('/login', routes.login);
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.get("/error.gif",require("./errortracking").frontend);
app.use(require("./errortracking").backend);
app.use(function(err,req,res,next){
  if(typeof err == "string"){
    return next({
      status: 400,
      message: err
    });
  }
  next(err);
});
app.use(errorHandler());

port = process.env.PORT || 7651;

app.listen(port, function () {
  console.log("server started at %d", port);
});
