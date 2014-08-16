var model = require('../../model');
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
    finish_time: req.body.finish_time,
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
    res.status(200).send(results[0]);
  });
}