// require('oneapm');
var express = require('express');
var namespace = require('express-namespace');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var compression = require('compression');
var passport = require('passport');
var config = require('config');
var wechat = require('wechat');
var uuid = require('uuid').v1;
var https = require('https');
var http = require('http');
var fs = require('fs');
var moment = require("moment");
var logger = require("./logger");
moment.locale('zh-cn');
require('express-di');

var startTime = +new Date();
require('colors');
var app = express();

var SERVICE = process.env.SERVICE == "worker" ? "worker" : "user";

require('./passport-init');
app.disable('etag');
app.set('view engine', 'jade');
app.set('views', __dirname + '/public/jade');

app.use(require('express-domain-middleware'));
app.use(function(req,res,next){
  req.reqid = uuid();
  next();
});
app.use(function(req,res,next){
  req.logger = require('./model/actionlog');
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
  logger.debug(SERVICE,req.method,req.url);
  if(req.method == "POST"){
    logger.debug(JSON.stringify(req.body,null,2));
  }
  next();
});
app.use(compression())
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
  res.locals.env = process.env.NODE_ENV;
  res.locals.package_version = require('./public/cortex.json').version;
  next();
});

var assureUserLogin = require("./routes/auth").user;
var assureWorkerLogin = require("./routes/auth").worker;
function constructing(req,res){
  res.render('constructing',{
    id:"constructing"
  });
}
if(SERVICE == "worker"){
  logger.debug("service worker");
  if(process.env.CCDEBUG){
    app.get("/", require('./routes/worker-orders-debug'));
  }
  app.use("/wechat/worker", require("./wechat").worker);
  // app.use(constructing);
  app.get("/authworker", require("./routes/authworker"));
  app.get("/orders/:orderid", assureWorkerLogin, require("./routes/orders").detail);
  // app.get("/orders", assureWorkerLogin, require("./routes/orders").list);
  app.get('/logout', require("./routes/logout"));
}else{

  app.use("/wechat/user", require("./wechat").user);
  // app.use(constructing);
  app.get('/', function(req,res){
    res.redirect('/wechat');
  });
  app.get('/login', require("./routes/login"));
  app.get('/logout', require("./routes/logout"));
  app.get("/contact-us", require("./routes/contact"));
  app.get("/services", require("./routes/services"));
  app.get("/wechat/packages", require("./routes/promos"));
  app.get('/wechat/recharge', assureUserLogin, require("./routes/recharge"));
  app.get('/wechat/', assureUserLogin, require("./routes/index"));
  app.get('/myorders/:orderid', require("./routes/myorders").detail);
  app.get('/myorders', assureUserLogin, require("./routes/myorders").list);
  app.get('/myinfos', assureUserLogin, require("./routes/myinfos"));
  app.get('/consume_promoqr', assureUserLogin, require("./routes/consume_promoqr"));
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
  logger.info("server started at %d", port || config.port);
});
