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
    service: SERVICE
  };
  next();
});

var assureUserLogin = require("./routes/auth").user;
var assureWorkerLogin = require("./routes/auth").worker;
if(SERVICE == "worker"){
  console.log("service worker");
  app.use("/wechat/worker", require("./wechat").worker);
  app.get("/authworker", require("./routes/authworker"));
  app.get("/orders/:orderid", assureWorkerLogin, require("./routes/orders").detail);
  app.get("/orders", assureWorkerLogin, require("./routes/orders").list);
  app.get('/logout', require("./routes/logout"));
}else{

  app.use("/wechat/user", require("./wechat").user);
  app.get('/login', require("./routes/login"));
  app.get('/logout', require("./routes/logout"));
  app.get('/', assureUserLogin, require("./routes/index"));
  app.get('/myorders', assureUserLogin, require("./routes/myorders"));
  app.get('/myinfos', assureUserLogin, require("./routes/myinfos"));
  app.get('/recharge', assureUserLogin, require("./routes/recharge"));
  app.get('/help', require("./routes/help"));
  app.namespace('/test', require('./test')(app));
}

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

app.listen(port, function () {
  console.log("server started at %d", port || config.port);
});








// create menu
var user_api = require('./util/wechat').user.api;
var user_menu = {
  "button": [{
    "type": "view",
    "name": "我要洗车",
    "url": config.host.user
  },{
    "type": "view",
    "name": "优惠活动",
    "url": config.host.user + "/recharge"
  },{
    "type": "view",
    "name": "我的订单",
    "url": config.host.user + "/myorders"
  }]
};

var worker_api = require('./util/wechat').worker.api;
var worker_menu = {
  "button": [
    {
      "name": "打卡",
      "sub_button": [{
        "type": "click",
        "name": "上班啦",
        "key": "ON_DUTY"
      },{
        "type": "click",
        "name": "下班喽",
        "key": "OFF_DUTY"
      }]
    },{
      "name": "订单",
      "sub_button": [{
        "type": "click",
        "name": "历史订单",
        "key": "VIEW_HISTORY"
      },{
        "type": "view",
        "name": "测试订单",
        "url" : config.host.worker + "/orders/53f08240113a19650e000002"
      },{
        "type": "view",
        "name": "退出登录",
        "url" : config.host.worker + "/logout"
      }]
    }
  ]
};

if(SERVICE == "worker"){
  console.log("create menu ", worker_menu);
  setTimeout(function(){
    worker_api.createMenu(worker_menu, function (err, data, response) {
      console.log("Menu Created", err, data);
    });
  },5000);
}else{
  console.log("create menu ", user_menu);
  user_api.createMenu(user_menu, function (err, data, response) {
    console.log("Menu Created", data);
  });
}