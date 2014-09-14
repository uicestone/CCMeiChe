var config = require('config');
var model = require('../../model');
var wechat_user = require('../../util/wechat').user;
var wechat_worker = require('../../util/wechat').worker;
var WechatUserApi = wechat_user.api;
var WechatWorkerApi = wechat_worker.api;
var Worker = model.worker;
var Order = model.order;
var User = model.user;
var moment = require("moment");
var async = require("async");
moment.locale('zh-cn');

exports.assure_match = function(req,res,next){
  var orderId = req.body.orderId;
  var user = req.user;
  if(!orderId){
    return next({
      status: 400,
      message: "missing orderId"
    });
  }

  Order.findById(orderId,function(err,order){
    if(err || !order){
      return next(err);
    }
    if(order.user._id.toString() !== user._id.toString()){
      return next({
        status: 400,
        message: "not your order"
      });
    }
    req.order = order;
    next();
  });
}

exports.list = function(req,res){
  Order.find({
    "user.phone": req.user.phone
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }
    res.status(200).send(orders);
  });
};

exports.confirm = function(req,res,next){
  var user = req.user;
  var order = req.order;

  User.updateDefaultCars(user.phone, order.cars, function(err){
    if(err){return next(err)}

    wechat_user.pay_request(req, {
      id: order._id,
      price: order.price,
      name: order.service.title + " * " + order.cars.length,
      attach: {
        type: "washcar"
      }
    }, function(err, payment_args){
      if(err){return next(err);}
      res.status(200).send(payment_args);
    });
  });
}

exports.cancel = function(req,res,next){
  var user = req.user;
  var order = req.order;
  var reason = req.body.reason;

  async.series([
    function(done){
      Order.cancel(order._id, reason, done);
    },
    function(done){
      Worker.removeOrder(order.worker._id, order, done);
    },
    function(done){
      if(reason == "order_cancel"){
        // 向腾讯发起退款请求
        done(null);
      }else{
        done(null);
      }
    },
    function(done){
      if(reason == "order_cancel"){
        WechatUserApi.sendText(user.openid, "您的订单已被取消，退款申请已经提交。", done);
      }else{
        done(null);
      }
    },
    function(done){
      if(reason == "order_cancel"){
        Worker.getMessage(order.worker._id, {
          action: "cancel",
          order: order
        }, function(err, message){
          if(err){return done(err);}
          WechatWorkerApi.sendText(order.worker.openid, message, done);
        });
      }else{
        done(null);
      }
    }
  ],function(err){
    if(err){
      return next(err);
    }
    res.status(200).send({message:"ok"});
  });
};