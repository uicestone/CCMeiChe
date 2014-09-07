var config = require('config');
var model = require('../../model');
var wechat_user = require('../../util/wechat').user;
var wechat_worker_api = require('../../util/wechat').worker.api;
var errortracking = require('../../errortracking');
var Worker = model.worker;
var Order = model.order;
var User = model.user;
var moment = require("moment");
var async = require("async");
moment.locale('zh-cn');

exports.assure_match = function(req,res,next){
  var orderId = req.body.orderId;
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

exports.confirm = function(req,res){
  var user = req.user;
  var order = req.order;

  User.updateDefaultCars(phone, cars, function(err){
    if(err){return next(err)}
    var payment_args = wechat_user.pay_request(req.ip, order);
    res.status(200).send(payment_args);
  });
}

exports.cancel = function(req,res,next){
  var user = req.user;
  var order = req.order;
  var reason = req.body.reason;

  Order.updateById(orderId, {
    $set: {
      "status":"cancel",
      "cancel_reason": reason,
      "cancel_time": new Date()
    }
  },function(err){
    if(err){
      return next(err);
      res.status(200).send("ok");
    }
  });
}