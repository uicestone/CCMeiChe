var config = require('config');
var model = require('../../model');
var wechat_user = require('../../util/wechat').user;
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

  async.waterfall([
    function(done){
      Order.cancel(order._id, reason, done);
    },
    function(needAdjust,done){
      if(needAdjust){
        // 查询worker为该车工，状态为preorder和todo，且preorder_time在该单之后的订单，将所有预估时间点按该单的预估完整时间提前
        Order.adjustRests(order.worker._id,done);
      }else{
        done(null);
      }
    },
    function(done){
      // 更新车工的最后可用时间为最后一单的完成时间，如果没有后续订单了，更新车工最后可用时间为当前时间。
      Worker.updateTimeAndLatlng(order.worker._id);
    }
  ],function(err, needAdjust){
    if(err){
      return next(err);
    }
  });
