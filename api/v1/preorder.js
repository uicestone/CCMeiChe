var models = require("../../model/");
var Worker = models.worker;
var Order = models.order;
var User = models.user;
var config = require("config");
var baidumap = require("../../util/baidumap");
var moment = require("moment");
var async = require("async");
var _ = require("underscore");

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

function findWorkers(latlng,callback){
  Worker.find({
    openid:{
      $ne: null
    },
    last_interaction_time:{$gt: new Date(+new Date() - 24 * 60 * 60 * 1000)},
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
    var getBaiduWalkSolution = baidumap.direction.bind(baidumap);
    var getFakeWalkSolution = function(args, callback){
      var solution = {
        result:{
          routes:[{
            distance: 5000
          }]
        }
      };
      callback(null, solution);
    };

    var getWalkSolution = process.env.DEBUG ? getFakeWalkSolution : getBaiduWalkSolution;

    getWalkSolution({
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

      var drive_time = solution.result.routes[0].distance / speedInMin;
      var wash_time = washtime();
      var base_time;
      if(worker.last_available_time){
        base_time = Math.max(new Date(worker.last_available_time), new Date());
      }else{
        base_time = new Date();
      }

      var arrive_time = new Date(+base_time + drive_time);
      var finish_time = new Date(+base_time + drive_time + wash_time);
      console.log(drive_time, wash_time);
      console.log("车工%s可用时间%s，预估驾驶耗时%s，预估洗车耗时%s，预估完成时间%s，距当前时间需要耗时%s",
        worker.name,
        moment(base_time).format("lll"),
        moment.duration(drive_time).humanize(),
        moment.duration(wash_time).humanize(),
        moment(finish_time).format("lll"),
        moment.duration(+finish_time - (+ new Date())).humanize()
      );
      done(null,{
        worker: worker,
        drive_time: drive_time,
        wash_time: wash_time,
        arrive_time: arrive_time,
        finish_time: finish_time
      });
    });
  },function(err,results){
    if(err){return callback(err);}
    function compare_nearest(a,b){
      return b.finish_time > a.finish_time ? -1 : 1;
    }
    results = results.sort(compare_nearest);
    console.log("选择车工%s",results[0].worker.name);
    var result = results[0];
    callback(null,result);
  });
}

exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;
  var service = req.body.service;
  var use_credit = req.body.use_credit == "true";
  var promo_count = +req.body.promo_count;
  var address = req.body.address;
  var cars = req.body.cars;
  var carpark = req.body.carpark;


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

  async.waterfall([
    function(done){
      findWorkers(user_latlng,done);
    },
    function(workers, done){
      nearestWorker(user_latlng,workers, done);
    },
    function(result, done){
      var priceAndCredit = calculatePriceAndCredit({
        service: service,
        use_credit: use_credit,
        promo_count: promo_count,
        user: user,
        cars: cars
      });

      Order.insert({
        worker: _.pick(result.worker,'_id','openid'), //订单对应的车工
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
        estimated_finish_time: result.finish_time,  // 预估完成时间
        estimated_arrive_time: result.arrive_time, // 预估到达时间
        status: "preorder"
      }, function(err, orders){
        if(err){
          return done(err);
        }
        done(null, orders[0]);
      });
    },
    function(order, done){
      User.addAddress(user.phone, order, function(err){
        if(err && err.name !== "EEXISTS"){
          return done(err);
        }
        return done(null, order);
      });
    }
  ], function(err, order){
    if(err){
      return next(err);
    }

    res.status(200).send(order);
  });
}