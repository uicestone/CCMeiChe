var async = require('async');
var model = require('../model');
var worker_api = require('./wechat').worker.api;
var user_api = require('./wechat').user.api;

var User = model.user;
var Worker = model.worker;
var Order = model.order;
var RechargeOrder = model.rechargeorder;
var DEBUG = process.env.DEBUG;

/**
 * 取消订单
 */
exports.cancel = function(orderId, reason, callback){
  var order = null;

  function needProcess(){
    return reason == "order_cancel" || reason == "admin_cancel" && order.status == "todo";
  }

  async.series([
    function(done){
      Order.findById(orderId, function(err, result){
        if(err){
          return done(err);
        }
        order = result;
        done(null);
      });
    },
    function(done){
      if(needProcess()){
        // 向腾讯发起退款请求
        if(process.env.DEBUG){
          done(null);
        }else{
          async.waterfall([
            function(done){
              Refund.insert({}, function(err, refunds){
                if(err){
                  return done(err);
                }
                done(null, refunds[0]._id);
              })
            },
            function(refundId, done){
              wechat_user.refund({
                out_trade_no: order._id,
                out_refund_no: refundId,
                total_fee: order.price /* 100 */,
                refund_fee: order.price
              }, function(err, data){
                if(err){
                  if(err.name == "BusinessError"){
                    done(data.err_code_des);
                  }
                  return done(err);
                }

                done(null, data);
              });
            }
          ], done);
        }
      }else{
        done(null);
      }
    },
    function(done){
      Order.cancel(order._id, reason, done);
    },
    function(done){
      Worker.removeOrder(order.worker._id, order._id, function(err){
        if(err){
          return done(err);
        }
        done(null);
      });
    },
    function(done){
      if(needProcess()){
        user_api.sendText(order.user.openid, "您的订单已被取消，退款申请已经提交。", done);
      }else{
        done(null);
      }
    },
    function(done){
      if(needProcess()){
        Worker.getMessage(order.worker._id, {
          action: "cancel",
          order: order
        }, function(err, message){
          if(err){return done(err);}
          worker_api.sendText(order.worker.openid, message, done);
        });
      }else{
        done(null);
      }
    }
  ], callback);
};

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
