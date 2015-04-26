var async = require('async');
var model = require('../model');
var worker_api = require('./wechat').worker.api;
var wechat_user = require('./wechat').user;
var user_api = wechat_user.api;
var logger = require("../logger");
var ActionLog = require('../model/actionlog');
var User = model.user;
var Worker = model.worker;
var Order = model.order;
var RechargeOrder = model.rechargeorder;
var MonthPackageOrder = model.monthpackageorder;
var Refund = model.refund;
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
      var recharge = {
        credit: order.credit
      };
      if(order.promo_count){
        recharge.promo = [{
          "_id" : order.service._id,
          "title" : order.service.title,
          "amount" : order.promo_count
        }];
      }
      User.recharge(order.user._id, recharge, done);
    },
    function(done){
      if(needProcess()){
        // 向腾讯发起退款请求
        var price = order.price * (order.user.isTest ? 1 : 100);
        ActionLog.log("系统",'退款', "向手机号" + order.user.phone + "退款" + order.price + '元');
        if(process.env.DEBUG || order.price == 0){
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
              var refund_info = {
                out_trade_no: order._id,
                out_refund_no: refundId,
                total_fee: Math.round(price),
                refund_fee: Math.round(price)
              };
              console.log("[refund]", refund_info);
              wechat_user.refund(refund_info, function(err, data){
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
      var util = require('util');
      ActionLog.log("系统", "取消订单", util.format("手机号:%s,原因:%s", order.user.phone, reason));
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
  async.waterfall([
    function(done){
      Order.confirm(orderId, done);
    },
    function(order, done){
      currentOrder = order;
      Worker.getMessage(order.worker._id, {action:"new"}, done);
    },
    function(message, done){
      logger.debug("sendText",currentOrder.worker.openid,message);
      worker_api.sendText(currentOrder.worker.openid,message,done);
    }
  ], callback);
};


// 充值
exports.monthpackage = function(openid, orderId, req, res, callback){
  var condition = DEBUG ? {
    phone: req.user.phone
  } : {
    openid: openid
  };

  async.waterfall([
    function(done){
      User.find(condition, done);
    },
    function(user, done){
      userId = user._id;
      MonthPackageOrder.findById(orderId, function(err, order){
        if(err || !order){
          return done(err);
        }


        req.logger.log(req.user, "支付包月订单", JSON.stringify(order.monthpackage));

        if(order.processed == true){
          var error = new Error();
          error.name = "OrderProcessed";
          return done(error);
        }

        done(null);
      });
    },
    function(done){
      MonthPackageOrder.updateById(orderId, {
        $set:{
          processed: true
        }
      }, done);
    }
  ], callback);
};

// 充值
exports.recharge = function(openid, orderId, req, res, callback){
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
      logger.debug("user", user);
      userId = user._id;
      RechargeOrder.findById(orderId, function(err, order){
        if(err || !order){
          return done(err);
        }

        if(order.recharge.type === "recharge"){
          ActionLog.log(order.user, "充值", order.recharge.title + " 支付 " + order.recharge.price);
        }else if(order.recharge.type == "promo"){
          ActionLog.log(order.user, "购买优惠券", order.recharge.title + " 支付 " + order.recharge.price);
        }
        if(order.processed == true){
          var error = new Error();
          error.name = "OrderProcessed";
          return done(error);
        }

        var recharge = order.recharge;

        done(null, {
          credit: recharge.actual_price || 0,
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
