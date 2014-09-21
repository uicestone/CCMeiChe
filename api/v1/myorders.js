var config = require('config');
var model = require('../../model');
var estimateTime = require("../../util/estimate");
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
var _ = require("underscore");
moment.locale('zh-cn');


function validatePromoCount(data){
  var service = data.service;
  var user = data.user;
  var promo_count = +data.promo_count;
  if(!promo_count){
    return true;
  }

  if(!user.promo){
    return false;
  }

  var my_promo = user.promo.filter(function(promo){
    return promo._id == service._id;
  });

  if(!my_promo || my_promo.amount < promo_count){
    return false;
  }

  return true;
}

// 实际需要支付的金额（由service，use_credit, promo_count，以及user.promo计算得到）
function calculatePriceAndCredit(data){
  var service = data.service;
  var use_credit = data.use_credit;
  var user = data.user;
  var promo_count = data.promo_count;
  var cars = data.cars;

  var cars_count = cars.length;
  var price = 0;
  var credit = 0;
  var user_credit = user.credit;

  for(var i = 0; i < cars_count; i++){
    if(promo_count){
      promo_count--;
    }else{
      price += (+service.price);
    }
  }

  if(use_credit){
    if(user_credit > price){
      credit = price;
      price = 0;
    }else{
      credit = user_credit;
      price = price - credit;
    }
  }

  return {
    credit: credit,
    price: price
  };
}

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


  var user_latlng = order.latlng;
  var service = order.service;
  var use_credit = order.use_credit == "true";
  var promo_count = +order.promo_count;
  var address = order.address;
  var cars = order.cars;
  var carpark = order.carpark;


  // more validations here
  if (!user_latlng) {
    return next({
      status: 400,
      message: "missing latlng"
    });
  }

  if (!service || !service._id){
    return next({
      status: 400,
      message: "invalid service"
    });
  }

  var user = req.user;
  var valid = validatePromoCount({
    service: service,
    user: user,
    promo_count: promo_count
  });

  if(!valid){
    return next({
      status: 401,
      message: "您没有足够的优惠券"
    });
  }

  user_latlng = user_latlng.split(",").map(function(item){return +item});

  var estimate = null;
  var order = null;
  async.waterfall([
    function(done){
      console.log("estimate time");
      estimateTime(user_latlng, function(err, result){
        if(err){
          return done(err);
        }
        estimate = result;
        done(null);
      });
    },
    function(done){
      console.log("add order");
      var priceAndCredit = calculatePriceAndCredit({
        service: service,
        use_credit: use_credit,
        promo_count: promo_count,
        user: user,
        cars: cars
      });

      var orderdata = {
        worker: _.pick(estimate.worker,'_id','openid'), //订单对应的车工
        user: _.pick(user,'_id','openid','phone'),  //下单用户
        cars: cars, //下单车辆
        service: service, //选择的服务
        address: address, //用户地址
        latlng: user_latlng, //订单经纬度
        carpark: carpark, //车辆停放位置
        use_credit: use_credit, //是否使用积分
        promo_count: promo_count, //使用几张优惠券
        price: priceAndCredit.price, // 支付金额
        credit: priceAndCredit.credit, // 支付积分
        preorder_time: new Date(), // 下单时间
        estimated_finish_time: estimate.finish_time,  // 预估完成时间
        estimated_arrive_time: estimate.arrive_time // 预估到达时间
      };

      Order.insert(orderdata, function(err, orders){
        if(err) return done(err);
        order = orders[0];
        done(null);
      });
    },
    function(done){
      console.log("update user address");
      User.addAddress(user.phone, order, function(err){
        if(err && err.name !== "EEXISTS"){
          return done(err);
        }
        return done(null);
      });
    },
    function(done){
      console.log("update default cars");
      User.updateDefaultCars(user.phone, order.cars, function(err){
        if(err){
          return done(err);
        }

        done(null);
      });
    },
    function(done){
      console.log("pay_request");
      wechat_user.pay_request(req, {
        id: order._id,
        price: order.price,
        name: order.service.title + " * " + order.cars.length,
        attach: {
          type: "washcar"
        }
      }, done);
    }
  ], function(err, payment_args){
    if(err){
      return next(err);
    }

    if(process.env.DEBUG){
      res.json({
        orderId: order._id
      });
    }else{
      res.json(payment_args);
    }
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