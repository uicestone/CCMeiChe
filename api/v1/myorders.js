var config = require('config');
var model = require('../../model');
var wechat_worker = require('../../util/wechat').worker.api;
var Worker = model.worker;
var Order = model.order;

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
      "worker._id": worker._id
    }).toArray(function(err,orders){
      if(err){return next(err);}
      var message = "你现在有" + order.length + "笔任务待完成，预计下班时间：" + data.estimated_finish_time;
      wechat_worker.sendText(worker.openid,message,function(err){
        if(err){return next(err);}
        res.status(200).send(results[0]);
      });
    });

  });
}