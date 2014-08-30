var config = require('config');
var model = require('../../model');
var wechat_worker = require('../../util/wechat').worker.api;
var errortracking = require('../../errortracking');
var Worker = model.worker;
var Order = model.order;
var moment = require("moment");
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

  Order.insert(data,function(err, results){
    if(err){return next(err);}
    var result = results[0];
    var worker = data.worker;

    Order.find({
      "worker._id": worker._id,
      "status": "todo"
    }).toArray(function(err,orders){
      if(err){return next(err);}
      var message = "";
      var url = "";

      if(orders.length == 1){
        url = config.host.worker + "/orders/" + orders[0]._id;
        message = "你有一比新订单，点击查看：" + url;
      }else{
        message = "你现在有" + orders.length + "笔任务待完成，预计下班时间：" + moment(data.estimated_finish_time).format("lll");
      }

      if(!worker.openid){
        return next("worker " + worker._id + " doesn't have openid");
      }

      console.log("sendText to",worker.openid,message);
      wechat_worker.sendText(worker.openid,message,function(err){
        if(err){
          errortracking.other(err,req,res);
        }
        res.status(200).send(results[0]);
      });
    });

  });
}