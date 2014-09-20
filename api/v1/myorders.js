var config = require('config');
var model = require('../../model');
var wechat_user = require('../../util/wechat').user;
var wechat_worker = require('../../util/wechat').worker;
var WechatUserApi = wechat_user.api;
var WechatWorkerApi = wechat_worker.api;
var Worker = model.worker;
var Order = model.order;
var User = model.user;
var Refund = model.refund;
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
  var order = req.body;

  async.series([
    function(done){
      Order.insert(order, function(err, orders){
        if(err) return done(err);
        order._id = orders[0]._id;
        done(null);
      });
    },
    function(done){
      User.updateDefaultCars(user.phone, order.cars, done);
    },
    function(done){
      wechat_user.pay_request(req, {
        id: order._id,
        price: order.price,
        name: order.service.title + " * " + order.cars.length,
        attach: {
          type: "washcar"
        }
      }, done);
    }
  ],function(err, payment_args){
    if(err){return next(err);}
    res.status(200).send({
      payargs: payment_args,
      orderId: order._id
    });
  });
}

exports.cancel = function(req,res,next){
  var user = req.user;
  var order = req.order;
  var reason = req.body.reason;

  async.series([
    function(done){
      if(reason == "order_cancel"){
        // 向腾讯发起退款请求

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
      }else{
        done(null);
      }
    },
    function(done){
      Order.cancel(order._id, reason, done);
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