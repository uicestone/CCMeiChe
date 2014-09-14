var wechat = require('wechat');
var config = require('config');
var worker_api = require('./util/wechat').worker.api;
var user_api = require('./util/wechat').user.api;
var model = require("./model");
var async = require('async');
var RechargeOrder = model.rechargeorder;
var UserMessage = model.usermessage;
var Worker = model.worker;
var User = model.user;
var Order = model.order;
var moment = require('moment');
var Notify = require('wechat-pay').middleware.Notify;
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
  console.log("user wechat recieves message %s",JSON.stringify(message,null,2));

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
      }
    });
  }
  UserMessage.insert(message);
});

exports.worker = wechat(config.wechat.worker.token, function(req,res,next){
  var message = req.weixin;
  var openid = message.FromUserName;

  console.log("worker wechat recieves message %s",JSON.stringify(message,null,2));
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
          console.log("update worker info fail");
        }
      });
    }

    Worker.updateLastIntraction(openid, function(err){
      if(err){
        console.log("update worker last intraction time fail");
      }
    });

    if(message.Event == "LOCATION"){
      Worker.updateStatus(openid, [+message.Latitude,+message.Longitude], function(){
        return res.reply("");
      });
      return;
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
        Order.find({
          "worker._id":user._id.toString(),
          "status":"done"
        }).limit(15).toArray(function(err,orders){
          if(err){
            console.log(err);
            return res.reply("");
          }
          var message = orders.map(function(order){
            var cars = order.cars.map(function(){
              return [car.number,car.type];
            }).join("\n");
            return [order.address,cars]
          }).join("\n\n");
          return res.reply(message);
        });
      }else{
        res.reply("");
      }
    }else{
      return res.reply("");
    }
  });
});


var wechat_worker = require('./util/wechat').worker.api;
var errortracking = require('./errortracking');
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
        console.log("已处理的" + options.title + "订单请求");
      }
      if(res.reply){
        console.log('reply success');
        res.reply('success');
      }else{
        console.log('normal reply');
        res.status(200).send({message:"ok"});
      }
    }
  }
}

function dealWashCar(openid, orderId, req, res, next){
  var currentOrder;
  async.waterfall([
    function(done){
      Order.confirm(orderId, done);
    },
    function(order, done){
      currentOrder = order;
      Worker.getMessage(order.worker._id, {action:"new"}, done);
    },
    function(message, done){
      console.log("sendText",currentOrder.worker.openid,message);
      wechat_worker.sendText(currentOrder.worker.openid,message,done);
    }
  ],handleResponse(res,{
    title: '洗车'
  }));
}

function dealRecharge(openid, orderId, req, res, next){
  console.log("dealing recharge", openid, orderId);
  var condition = DEBUG ? {
    phone: req.user.phone
  } : {
    openid: openid
  };
  async.waterfall([
    function(done){
      User.findOne(condition, done);
    },
    function(user, done){
      console.log("user", user);
      RechargeOrder.findById(orderId, function(err, order){
        if(err || !order){
          return done(err);
        }

        if(order.processed == true){
          var error = new Error();
          error.name = "OrderProcessed";
          return done(error);
        }

        var recharge = order.recharge;
        var userpromos = user.promo || [];

        recharge.promo.forEach(function(promo){
          var userpromo = userpromos.filter(function(item){
            return item._id == promo._id;
          })[0];
          if(userpromo){
            userpromo.amount += promo.amount;
          }else{
            promo.amount = promo.amount;
            userpromos.push(promo);
          }
        });

        done(null, {
          credit: recharge.actual_price,
          promo: userpromos
        });
      });
    },
    function(recharge, done){
      User.update(condition, {
        $inc:{
          credit: recharge.credit
        },
        $set: {
          promo: recharge.promo
        }
      },function(err){
        if(err){return done(err);}
        RechargeOrder.updateById(orderId, {
          $set:{
            processed: true
          }
        },done);
      });
    }
  ],handleResponse(res,{
    title: '充值'
  }));
}

function recieveNotify(openid, orderId, type, req, res, next){
  if(type == "washcar"){
    dealWashCar(openid, orderId,req,res,next);
  }else if(type == "recharge"){
    dealRecharge(openid, orderId,req,res,next);
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