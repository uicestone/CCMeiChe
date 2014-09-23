var async = require('async');
var model = require('../model');
var worker_api = require('./wechat').worker.api;

var User = model.user;
var Worker = model.worker;
var Order = model.order;
var RechargeOrder = model.rechargeorder;
var DEBUG = process.env.DEBUG;

/**
 * 取消订单
 */
exports.cancel = function(){};

exports.washcar = function(openid, orderId, req, res, callback){
  var currentOrder;
  console.log("washcar", openid, orderId)
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
      worker_api.sendText(currentOrder.worker.openid,message,done);
    }
  ], callback);
};

// 购买优惠券
exports.promo = function(openid, orderId, req, res, callback){

}

// 充值
exports.recharge = function(openid, orderId, req, res, callback){
  console.log("dealing recharge", openid, orderId);
  var condition = DEBUG ? {
    phone: req.user.phone
  } : {
    openid: openid
  };
  var userId = null;
  async.waterfall([
    function(done){
      User.findOne(condition, done);
    },
    function(user, done){
      console.log("user", user);
      userId = user._id;
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

        done(null, {
          credit: recharge.actual_price,
          promo: recharge.promo
        });
      });
    },
    function(recharge, done){
      User.recharge(userId, recharge, function(err){
        if(err){
          return done(err);
        }
        done(null);
      });
    },
    function(done){
      RechargeOrder.updateById(orderId, {
        $set:{
          processed: true
        }
      }, done);
    }
  ], callback);
};
