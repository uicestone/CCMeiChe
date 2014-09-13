var wechat = require('wechat');
var config = require('config');
var worker_api = require('./util/wechat').worker.api;
var user_api = require('./util/wechat').worker.api;
var model = require("./model");
var async = require('async');
var RechargeOrder = model.rechargeorder;
var UserMessage = model.usermessage;
var Worker = model.worker;
var User = model.user;
var Order = model.order;
var moment = require('moment');
var Notify = require('wechat-pay').middleware.Notify;

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

    if(message.Event == "LOCATION"){
      Worker.updateStatus(openid, [+message.Latitude,+message.Longitude]);
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
function dealWashCar(orderId, req, res, next){
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
      wechat_worker.sendText(currentOrder.worker.openid,message,done);
    }
  ],function(err){
    if(err){
      return next(err);
    }else{
      res.status(200).send({message:"ok"});
    }
  });
}

function dealRecharge(orderId, req, res, next){
  console.log("orderId", orderId);
  RechargeOrder.findById(orderId, function(err, order){
    if(err || !order){
      return next(err);
    }
    var recharge = order.recharge;
    var user = req.user;
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

    User.update({
      phone:user.phone
    },{
      $inc:{
        credit: recharge.actual_price
      },
      $set: {
        promo: userpromos
      }
    },function(err,user){
      if(err){return next(err);}
      res.status(200).send({message:"ok"});
    });
  });
}

function recieveNotify(orderId, type, req, res, next){
  if(type == "washcar"){
    dealWashCar(orderId,req,res,next);
  }else if(type == "recharge"){
    dealRecharge(orderId,req,res,next);
  }else{
    next({
      status: 400,
      message: "wrong type"
    });
  }
}

if(process.env.DEBUG){
exports.notify = function(req,res,next){
  var order_id = req.body.orderId;
  var type = req.body.type;
  recieveNotify(order_id, type, req, res, next);
};
}else{

exports.notify = Notify(
  config.wechat.user.id,
  config.wechat.user.pay_sign_key,
  config.wechat.user.partner_id,
  config.wechat.user.partner_key
).done(function (message, req, res, next) {
  var openid = message.OpenId;
  var order_id = req.query.out_trade_no;
  var attach = {};
  try{
   attach = JSON.parse(req.query.attach);
  }catch(e){}
  recieveNotify(order_id, attach.type, req, req, next);
});
}