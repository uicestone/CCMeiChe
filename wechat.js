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
var DEBUG = process.env.DEBUG;
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
    User.findByOpenId(openid, function(err,user){
      if(err || !user){
        res.reply("");
        return;
      }

      if(!user.wechat_info){
        updateInfo(openid, User, user_api, function(){
          res.reply("");
        });
      }else{
        res.reply("");
      }
    });
  }
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
      console.log("[车工上报位置]", user.name, [+message.Longitude,+message.Latitude].join(","));

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
        console.log("[更新车工位置]", user.name, [+result.x,+result.y].join(","));
        Worker.updateStatus(openid, [+result.y,+result.x], function(){
          return res.reply("");
        });
      });
    }

    if(message.MsgType == "text"){
      return (function(content){
        var year = +content.slice(0,4);
        var month = +content.slice(4,6) - 1;
        if(year.toString() == "NaN" || month.toString() == "NaN" || year < 2014 || year > 2050 || month < 0 || month > 12){
          return res.reply("请输入正确格式查看历史订单 例: 201409");
        }

        Order.getMonthly(user._id, new Date(year, month), sendMonthly(res));
      })(message.Content);
    }

    if(message.EventKey == "ON_DUTY"){
      // 上班
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