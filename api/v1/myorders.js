var config = require('config');
var model = require('../../model');
var wechat_worker = require('../../util/wechat').worker.api;
var errortracking = require('../../errortracking');
var Worker = model.worker;
var Order = model.order;
var User = model.user;
var moment = require("moment");
var async = require("async");
moment.locale('zh-cn');

exports.get = function(req,res){
  Order.find({
    "user.phone": req.user.phone
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }
    res.status(200).send(orders);
  });
};

/**
 * 生成订单
 * @param phone(from user) 手机号
 * @param cars 车辆
 * @param service 服务
 * @param address 地址
 * @param latlng 经纬度
 * @param position 具体车位
 * @param  {[type]}   res  [description]
 */
exports.post = function(req,res,next){
  var user = req.user;
  var data = {
    user: user,
    cars: req.body.cars,
    service: req.body.service,
    address: req.body.address,
    latlng: req.body.latlng,
    worker: req.body.worker,
    carpark: req.body.carpark,
    credit: req.body.credit,
    promo_count: req.body.promo_count,
    order_time: new Date(),
    estimated_finish_time: new Date(req.body.estimated_finish_time),
    estimated_drive_time: req.body.estimated_drive_time,
    estimated_wash_time: req.body.estimated_wash_time,
    status: "todo"
  };
  var keys = Object.keys(data);
  for(var i = 0 ; i < keys.length; i++){
    if(!data[keys[i]]){
      res.send("missing " + keys[i]);
      break;
    }
  }

  var worker = data.worker;
  var cars = data.cars;

  async.series([
    function updateUserCars(done){
      user.cars = user.cars.map(function(car){
        car["default"] = cars.some(function(postCar){
          return postCar.number == car.number;
        });
        return car;
      });
      User.update({
        phone: user.phone
      },{
        $set:{
          cars: user.cars
        }
      },done);
    },
    function insertOrder(done){
      Order.insert(data, function(err, results){
        if(err){
          return done(err);
        }
        result = results[0];
        done(null);
      });
    },
    function notifyWorker(done){
      Order.find({
        "worker._id": worker._id,
        "status": "todo"
      }).toArray(function(err,orders){
        if(err){return done(err);}
        var message = "";
        var url = "";

        // 给车工发送消息
        if(orders.length == 1){
          url = config.host.worker + "/orders/" + orders[0]._id;
          message = "你有一比新订单，点击查看：" + url;
        }else{
          message = "你现在有" + orders.length + "笔任务待完成，预计下班时间：" + moment(data.estimated_finish_time).format("lll");
        }

        if(!worker.openid){
          return done("worker " + worker._id + " doesn't have openid");
        }

        console.log("sendText to",worker.openid,message);
        wechat_worker.sendText(worker.openid,message,function(err){
          if(err){
            return errortracking.other(err,req,res);
          }
          done(null)
        });
      });
    }
  ],function(err){
    if(err){
      return next(err);
    }

    res.status(200).send(result);
  });
}