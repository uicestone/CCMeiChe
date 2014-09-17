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
var https = require('https');
var http = require('http');
var fs = require('fs');

var startTime = +new Date();
require('colors');
var app = express();

var SERVICE = process.env.SERVICE == "worker" ? "worker" : "user";

require('./passport-init');

app.set('view engine', 'jade');
app.set('views', __dirname + '/public/jade');
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
  console.log(SERVICE,req.method,req.url);
  if(req.method == "POST"){
    console.log(JSON.stringify(req.body,null,2));
  }
  next();
});
app.use(express.static(__dirname + '/public'))
app.use(passport.initialize());
app.use(passport.session());


// global config for views
app.use(function(req,res,next){
  res.locals.config = {
    qiniu_host: config.qiniu.host,
    service: SERVICE,
    start_time: startTime
  };
  console.log(startTime);
  res.locals.env = process.env.NODE_ENV;
  res.locals.package_version = require('./public/cortex.json').version;
  next();
});

var assureUserLogin = require("./routes/auth").user;
var assureWorkerLogin = require("./routes/auth").worker;
if(SERVICE == "worker"){
  console.log("service worker");
  if(process.env.DEBUG){
    app.get("/", require('./routes/worker-orders-debug'));
  }
  app.use("/wechat/worker", require("./wechat").worker);
  app.get("/authworker", require("./routes/authworker"));
  app.get("/orders/:orderid", assureWorkerLogin, require("./routes/orders").detail);
  app.get("/orders", assureWorkerLogin, require("./routes/orders").list);
  app.get('/logout', require("./routes/logout"));
}else{

  app.use("/wechat/user", require("./wechat").user);
  app.get('/login', require("./routes/login"));
  app.get('/logout', require("./routes/logout"));
  app.get("/contact", require("./routes/contact"));
  app.get('/wechat/', assureUserLogin, require("./routes/index"));
  app.get('/myorders/:orderid', assureUserLogin, require("./routes/myorders").detail);
  app.get('/myorders', assureUserLogin, require("./routes/myorders").list);
  app.get('/myinfos', assureUserLogin, require("./routes/myinfos"));
  app.get('/wechat/recharge', assureUserLogin, require("./routes/recharge"));
  app.get('/help', require("./routes/help"));
}


app.use('/wechat/notify', require('./wechat').notify);
app.namespace("/api/v1", require("./api/v1")(app));

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

var port;
if(SERVICE == "worker"){
  port = process.env.PORT || config.port.worker;
}else{
  port = process.env.PORT || config.port.user;
}

app.listen(port,function(){
  console.log("server started at %d", port || config.port);
});