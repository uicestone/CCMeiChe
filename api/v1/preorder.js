var worker = require("../../model/worker");
var config = require("config");
var baidumap = require("../../util/baidumap");
var moment = require("moment");
var async = require("async");

function washtime(){
  return config.wash_time * 60 * 1000;
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
  var credit = user.credit;

  for(var i = 0; i < cars_count; i++){
    if(promo_count){
      promo_count--;
    }else{
      price += (+service.price);
    }
  }

  if(use_credit){
    if(credit < price){
      price = price - credit;
      credit = 0;
    }else{
      credit = credit - price;
      price = 0;
    }
  }

  return {
    credit: credit,
    price: price
  };
}

function validatePromoCount(data){
  var service = data.service;
  var user = data.user;
  var promo_count = data.promo_count;
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

function findWorkers(latlng,callback){
  worker.find({
    openid:{
      $ne: null
    },
    status:"on_duty",
    latlng:{
      $near: latlng
    }
  }).limit(5).toArray(function (err, workers) {
    if(err){return callback(err);}
    if(!workers.length){
      return callback({
        status: 400,
        message: "未找到可用车工"
      });
    }
    callback(null, workers);
  });
}

function nearestWorker(latlng, workers, callback){
  async.map(workers, function(worker, done){
    var motor_speed = 20; // km/h
    var worker_latlng = worker.last_available_latlng || worker.latlng ;
    var speedInMin = motor_speed * 1000 / (60 * 60 * 1000); // km/h 转换为 m/ms

    // 通过百度api查询路线
    console.log("查询baidu地图路线 %s 到 %s",worker_latlng,user_latlng);
    baidumap.direction({
      origin: worker_latlng.join(","),
      destination: latlng.join(","),
      mode:"walking",
      origin_region: "上海",
      destination_region: "上海"
    }, function(err,solution){
      if(err){return done(err);}
      if(!solution || !solution.result || !solution.result.routes[0]){
        return done("solution parse error " + JSON.stringify(solution));
      }

      if(!worker.last_available_time){
        return done("worker " + worker._id + " do not have last_available_time");
      }

      var drive_time = solution.result.routes[0].distance / speedInMin;
      var wash_time = washtime();
      var base_time = Math.max(new Date(worker.last_available_time), new Date());
      done(null,{
        worker: worker,
        drive_time: drive_time,
        wash_time: wash_time,
        arrive_time: new Date(base_time + drive_time),
        finish_time: new Date(base_time + drive_time + wash_time)
      });
    });
  },function(err,results){
    if(err){return next(err);}
    function compare_nearest(a,b){
      return b.finish_time > a.finish_time ? -1 : 1;
    }
    results = results.sort(compare_nearest);

    var result = results[0];
    callback(null,result);
  });
}

exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;
  var service = req.body.service;
  var use_credit = req.body.use_credit == "true";
  var promo_count = req.body.promo_count;
  var address = req.body.address;
  var cars = req.body.cars;
  var carpark = req.body.carpark;

  var user = req.user;
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

  var valid = validatePromoCount({
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

  findWorkers(user_latlng,function(err, workers){
    if(err){return next(err);}
    nearestWorker(user_latlng,workers,function(err,result){
      if(err){return next(err);}

      var priceAndCredit = calculatePriceAndCredit({
        service: service,
        use_credit: use_credit,
        promo_count: promo_count,
        user: user,
        cars: cars
      });

      Order.insert({
        worker: result.worker, //订单对应的车工
        user: user,  //下单用户
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
        estimated_finish_time: result.finish_time,  // 预估完成时间
        estimated_arrive_time: result.arrive_time, // 预估到达时间
        status: "preorder"
      },function(err, order){
        if(err){
          return next(err);
        }

        worker.updateById(result.worker._id,{
          $set:{
            last_available_time: result.finish_time,
            last_available_latlng: user_latlng
          },
          $addToSet: {
            orders: order._id
          }
        },function(err){
          if(err){
            return next(err);
          }
          res.status(200).send(order);
        });

        // 超时取消订单
        setTimeout(function(){
          Order.findById(order._id, function(err,order){
            if(order && order.status == "preorder"){
              Order.updateById(order._id, {
                $set: {
                  "status":"cancel",
                  "cancel_reason": "timeout",
                  "cancel_time": new Date()
                }
              });
            }
          });
        },10 * 60 * 1000);

      });

    });
  });
}