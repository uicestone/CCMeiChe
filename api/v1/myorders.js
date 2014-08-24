var config = require('config');
var model = require('../../model');
var wechat_worker = require('../../util/wechat').worker.api;
var Worker = model.worker;
var Order = model.order;

exports.get = function(req,res){
  Order.find({
    phone: req.user.phone
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
    phone: user.phone,
    cars: req.body.cars,
    service: req.body.service,
    address: req.body.address,
    latlng: req.body.latlng,
    worker: req.body.worker_id,
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
    Worker.findById(data.worker,function(err,worker){
      if(err){return next(err);}
      if(!worker || !worker.openid){return next(new Error("worker not find"));}
      var url = config.host.worker + "/orders/" + results._id;
      var message = "你有一笔新订单：" + url;
      wechat_worker.sendText(worker.openid,message,function(err){
        if(err){return next(err);}
        res.status(200).send(results[0]);
      });
    });
  });
}