var config = require('config');
var model = require('../../model');
var estimateTime = require("../../util/estimate").getSolution;
var wechat_user = require('../../util/wechat').user;
var wechat_worker = require('../../util/wechat').worker;
var charge = require('../../util/charge');
var logger = require('../../logger');
var Worker = model.worker;
var Order = model.order;
var User = model.user;
var Refund = model.refund;
var async = require("async");
var _ = require("underscore");


function validatePromoCount(data) {
  var service = data.service;
  var user = data.user;
  var promo_count = +data.promo_count;
  if (!promo_count) {
    return true;
  }

  if (!user.promo) {
    return false;
  }

  var my_promo = user.promo.filter(function (promo) {
    return promo._id == service._id;
  });

  if (!my_promo || my_promo.amount < promo_count) {
    return false;
  }

  return true;
}

// 实际需要支付的金额（由service，use_credit, promo_count，以及user.promo计算得到）
function calculatePriceAndCredit(data) {
  var service = data.service;
  var use_credit = data.use_credit;
  var user = data.user;
  var promo_count = data.promo_count;
  var cars = data.cars;

  var cars_count = cars.length;
  var price = 0;
  var credit = 0;
  var user_credit = user.credit;

  for (var i = 0; i < cars_count; i++) {
    if (promo_count) {
      promo_count--;
    } else {
      price += (+service.price);
    }
  }

  if (use_credit) {
    if (user_credit > price) {
      credit = price;
      price = 0;
    } else {
      credit = user_credit;
      price = price - credit;
    }
  }

  return {
    credit: credit,
    price: price
  };
}

exports.assure_match = function (req, res, next) {
  var orderId = req.body.orderId;
  var user = req.user;
  if (!orderId) {
    return next({
      status: 400,
      message: "missing orderId"
    });
  }

  Order.findById(orderId, function (err, order) {
    if (err || !order) {
      return next(err);
    }
    if (order.user._id.toString() !== user._id.toString()) {
      return next({
        status: 400,
        message: "not your order"
      });
    }
    req.order = order;
    next();
  });
}

exports.list = function (req, res) {
  Order.find({
    "user._id": req.user._id
  }).toArray(function (err, orders) {
    if (err) {
      return next(err);
    }
    res.status(200).send(orders);
  });
};

exports.confirm = function (req, res, next) {
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

  if (!service || !service._id) {
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

  if (!valid) {
    return next({
      status: 401,
      message: "您没有足够的优惠券"
    });
  }

  user_latlng = user_latlng.split(",").map(function (item) {
    return +item
  });

  var estimate = null;
  var order = null;
  async.waterfall([

    function (done) {
      estimateTime(user_latlng, service, function (err, result) {
        if (err) {
          return done(err);
        }
        estimate = result;
        done(null);
      });
    },
    function (done) {
      var priceAndCredit = calculatePriceAndCredit({
        service: service,
        use_credit: use_credit,
        promo_count: promo_count,
        user: user,
        cars: cars
      });

      var orderdata = {
        worker: _.pick(estimate.worker, '_id', 'openid'), //订单对应的车工
        user: _.pick(user, '_id', 'openid', 'phone', 'isTest'), //下单用户
        cars: cars, //下单车辆
        service: service, //选择的服务
        address: address, //用户地址
        latlng: user_latlng, //订单经纬度
        carpark: carpark, //车辆停放位置
        use_credit: use_credit, //是否使用积分
        promo_count: promo_count, //使用几张优惠券
        price: +priceAndCredit.price.toFixed(2), // 支付金额
        credit: priceAndCredit.credit, // 支付积分
        preorder_time: new Date(), // 下单时间
        estimated_finish_time: estimate.finish_time, // 预估完成时间
        estimated_arrive_time: estimate.arrive_time // 预估到达时间
      };

      Order.insert(orderdata, function (err, orders) {
        if (err) return done(err);
        order = orders[0];
        done(null);
      });
    },
    function (done) {
      User.addAddress(user._id, order, function (err) {
        if (err && err.name !== "EEXISTS") {
          return done(err);
        }
        return done(null);
      });
    },
    function (done) {
      logger.debug("update default cars");
      User.updateDefaultCars(user._id, order.cars, done);
    },
    function (done) {
      logger.debug("pay_request");

      if (!order.price) {
        return charge.washcar(user.openid, order._id, req, res, function (err) {
          if (err) {
            return done(err);
          }
          return done(null, {
            code: 200,
            message: "ok"
          });
        });
      }

      req.logger.log(req.user, "付款", order.price + "元");
      wechat_user.pay_request(req, {
        id: order._id,
        price: order.price,
        name: order.service.title + " * " + order.cars.length,
        attach: {
          type: "washcar"
        }
      }, function (err, payargs) {
        if (err) {
          return done(err);
        }
        done(null, {
          code: 201,
          payargs: payargs
        });
      });
    }
  ], function (err, result) {
    if (err) {
      return next(err);
    }

    if (result.code == 201 && process.env.CCDEBUG) {
      res.json({
        code: 201,
        orderId: order._id
      });
    } else {
      res.json(result);
    }
  });
}

exports.share = function (req, res, next) {
  var orderId = req.body.orderId;
  var user = req.user;
  Order.findById(orderId, function (err, order) {
    if (err || !order) {
      return next();
    }

    if (order.user._id.toString() !== user._id.toString()){
      logger.debug(order.user._id , user._id, "not match");
      return res.status(401).send({
        message: "access denied"
      });
    }
    if (order.shared) {
      logger.debug("订单%s已经处理",orderId);
      return res.send({
        message: "processed"
      });
    }

    async.series([
      function (done) {
        logger.debug("update user");
        User.updateById(user._id, {
          $inc:{
            credit: 5
          }
        }, done);
      },
      function (done) {
        Order.updateById(orderId, {
          $set: {
            shared: true
          }
        }, done);
      }
    ], function (err) {
      if (err) {
        return next(err);
      }

      res.send({
        message: "ok"
      })
    });
  });
};

exports.cancel = function (req, res, next) {
  var user = req.user;
  var orderId = req.body.orderId;
  var reason = req.body.reason;


  charge.cancel(orderId, reason, function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).send({
      message: "ok"
    });
  });
};