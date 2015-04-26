var wechat = require('wechat');
var config = require('config');
var worker_api = require('./util/wechat').worker.api;
var user_api = require('./util/wechat').user.api;
var moment = require('moment');
var Notify = require('wechat-pay').middleware.Notify;
var charge = require('./util/charge');
var model = require("./model");
var logger = require("./logger");
var async = require('async');
var baidumap = require('./util/baidumap');
var _ = require('underscore');

var RechargeOrder = model.rechargeorder;
var UserMessage = model.usermessage;
var Worker = model.worker;
var User = model.user;
var Order = model.order;
var MonthPackageOrder = model.monthpackageorder;
var DEBUG = process.env.CCDEBUG;
function updateInfo(openid,Model,api,callback){
  api.getUser(openid, function(err, result){
    if(err){return callback(err);}
    if(result){
      Model.update({
        openid: openid
      },{
        $set:{
          wechat_info: result
        }
      },callback);
    }else{
      callback(null);
    }
  });
}

exports.user = wechat(config.wechat.user.token, function(req,res){
  var message = req.weixin;
  var openid = message.FromUserName;
  logger.debug("user wechat recieves message %s",JSON.stringify(message,null,2));

  if(message.Event == "subscribe"){
    res.reply("欢迎关注CC美车 \\(^o^)/");
  }else{
    res.reply("");
  }

  if(message.Content == "天王盖地虎"){
    user_api.sendText(message.FromUserName,"宝塔镇河妖", function(){
    });
  }

  User.findByOpenId(openid, function(err,user){
    if(err || !user){
      return;
    }

    if(!user.wechat_info){
      updateInfo(openid, User, user_api, function(){});
    }

    User.update({
      openid: openid
    },{
      $set:{
        last_interaction_time: new Date()
      }
    });
  });

  UserMessage.insert(message);
});

exports.worker = wechat(config.wechat.worker.token, function(req,res,next){
  var message = req.weixin;
  var openid = message.FromUserName;

  logger.debug("worker wechat recieves message %s",JSON.stringify(message,null,2));

  Worker.findByOpenId(openid, function(err,user){
    if(err){
      console.error(err);
      return res.reply("");
    }

    if(message.Event == "subscribe" && !user){
      return res.reply("欢迎加入CC美车，请管理员添加用户" + openid);
    }

    if(message.EventKey && !user){
      return res.reply("您没有权限进行该操作，请管理员添加用户" + openid);
    }

    if(!user){
      return res.reply("");
    }

    if(!user.wechat_info){
      updateInfo(openid, Worker, worker_api, function(err){
        if(err){
          logger.debug("update worker info fail");
        }
      });
    }

    Worker.updateLastIntraction(openid, function(err){
      if(err){
        logger.debug("update worker last intraction time fail");
      }
    });

    if(message.Event == "LOCATION"){
      // 纬度，经度
      req.logger.log(user, "车工上报位置", [+message.Longitude,+message.Latitude].join(","));

      return baidumap.geoconv({
        coords: [+message.Longitude,+message.Latitude].join(","),
        from: 1,
        to: 5
      }, function(err,json){
        if(err){
          return res.reply("");
        }

        if(json.status != 0){
          console.error("error", JSON.stringify(json));
          return res.reply("");
        }

        var result = json.result[0];
        req.logger.log("系统", "更新车工位置", [+result.x,+result.y].join(","));
        Worker.updateStatus(openid, [+result.y,+result.x], function(){
          return res.reply("");
        });
      });
    }

    if(message.MsgType == "text"){

      function isValidMonth(content){
        var year = +content.slice(0,4);
        var month = +content.slice(4,6) - 1;
        return !(year.toString() == "NaN"
          || month.toString() == "NaN"
          || year < 2014
          || year > 2050
          || month < 0
          || month > 12);
      }

      function toDate(content){
        var year = +content.slice(0,4);
        var month = +content.slice(4,6) - 1;
        return new Date(year, month);
      }

      function isCarNumber(content){
        return content.split(",").some(function(item){
          return /^[\u4e00-\u9fa5]{1}[A-Z0-9]{6}$/.test(item);
        });
      }

      var orderUser;
      var content = message.Content;
      var theMonthOrder;
      if(isValidMonth(content)){
        return Order.getMonthly(user._id, toDate(content), sendMonthly(res));
      }else if(isCarNumber(content)){
        return async.waterfall([
          function(done){
            Order.findWaitingOrdersByWorker(user._id, function(err, orders){
              if(err){
                return done(err);
              }
              var order = orders[0];
              if(order){
                return done("手头有未完成的订单，请先完成：" + config.host.worker + "/orders/" + order._id);
              }
              done(null);
            });
          },
          function(done){
            MonthPackageOrder.findByCarNumber(content, function(err, order){
              if(err){
                return done(err);
              }else if(!order){
                return done("没有对应该车号的包月订单");
              }else{
                return done(null, order);
              }
            });
          },
          function(monthorder, done){
            theMonthOrder = monthorder;
            async.parallel([
              function(done){
                User.findById(monthorder.user._id, done);
              },
              function(done){
                Order.generateByMonthOrder(monthorder, user, done);
              }
            ], done);
          }
        ], function(err, results){
          if(err){
            console.error(err);
            return res.reply(typeof err == "string" ? err : "");
          }

          var user = results[0];
          var order = results[1];

          // 回复客户名称，车型和一个链接
          var username = user.wechat_info ? user.wechat_info.nickname : ("用户" + user.phone);
          var cars = order.cars.map(function(car){
            return "车型:" + car.type + "，车号:" + car.number +  "，" + car.color + "色";
          }).join(",");
          var link = config.host.worker + "/orders/" + order._id;
          req.logger.log(user, "生成常规订单", "订单号：" + order._id + "包月订单号：" + theMonthOrder._id);
          res.reply(username + " " + cars + " " + link);
        });
      }else{
        return res.reply("输入月份查看当月订单，例: 201409\n输入车牌号进行包月洗车");
      }
    }

    if(message.EventKey == "ON_DUTY"){
      // 上班
      req.logger.log(user, "上班");
      if(user.status == "on_duty"){
        return res.reply("你已经在上班了，好好干！");
      }
      Worker.onDuty(openid, function(err){
        if(err){
          console.error(err);
          return res.reply("");
        }
        res.reply("你已经在上班了，好好干！");
      });
    }else if(message.EventKey == "OFF_DUTY"){
      req.logger.log(user, "下班");
      // 下班
      if(user.status == "off_duty"){
        return res.reply("你已经下班了，享受生活吧。");
      }
      Worker.offDuty(openid, function(err){
        if(err){
          console.error(err);
          return res.reply("");
        }
        res.reply("你已经下班了，享受生活吧。");
      });
    }else if(message.EventKey == "VIEW_HISTORY"){
      if(user){
        Order.getMonthly(user._id, new Date(), sendMonthly(res));
      }else{
        res.reply("");
      }
    }else if(message.EventKey == "VIEW_CURRENT_ORDER"){
      Order.getCurrent(user._id, function(err, order){
        if(order){
          res.reply("您的当前订单：" + config.host.worker + "/orders/" + order._id);
        }else{
          res.reply("您当前没有订单，请原地等候");
        }
      });
    }else{
      return res.reply("");
    }
  });
});

function sendMonthly(res){
  return function(err, orders){
    if(err){
      logger.debug(err);
      return res.reply("");
    }
    var services = {};
    var count = 0;
    orders.forEach(function(order){
      if(!services[order.service.title]){
        services[order.service.title] = 1;
      }else{
        services[order.service.title] += 1;
      }
      count += 1;
    });
    if(!orders.length){
      return res.reply("您查询的月份没有订单记录");
    }
    message = moment(orders[0].finish_time).format('YYYY年MM月订单汇总') + '\n';
    message += Object.keys(services).map(function(name){
      return name + ": " + services[name];
    }).join("\n");
    message += "\n" + "总订单数: " + count;
    logger.debug(message);
    return res.reply(message);
  }
}

function handleResponse(res, options){
  return function(err){
    if(err && err.name !== "OrderProcessed"){
      if(res.reply){
        res.reply(err);
      }else{
        return res.status(500).send(err);
      }
    }else{
      if(err && err.name == "OrderProcessed"){
        logger.debug("已处理的" + options.type + "订单请求");
      }
      if(res.reply){
        res.reply('success');
      }else{
        res.status(200).send({message:"ok"});
      }
    }
  }
}

function recieveNotify(openid, orderId, type, req, res, next){
  var dealFunc = charge[type];

  if(dealFunc && _.isFunction(dealFunc)){
    dealFunc(openid, orderId, req, res, handleResponse(res, {type: type}));
  }else{
    next({
      status: 400,
      message: "wrong type"
    });
  }
}

if(DEBUG){
exports.notify = function(req,res,next){
  var order_id = req.body.orderId;
  var type = req.body.type;
  recieveNotify(req.user.openid, order_id, type, req, res, next);
};
}else{
exports.notify = Notify({
  partnerKey: config.wechat.user.partner_key,
  appId: config.wechat.user.id,
  mchId: config.wechat.user.mch_id,
  notifyUrl: config.wechat.user.notify_url
}).done(function (message, req, res, next) {
  var openid = message.openid;
  var order_id = message.out_trade_no;
  var attach = {};
  try{
   attach = JSON.parse(message.attach);
  }catch(e){}
  recieveNotify(openid, order_id, attach.type, req, res, next);
});
}