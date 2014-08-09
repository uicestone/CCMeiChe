var model = require('../../model');
var Order = model.order;

exports.get = function(req,res){
  console.log(req.user);
  res.send("order");
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

  Order.insert({
    phone: user.phone,
    cars: req.body.cars,
    service: req.body.service,
    address: req.body.address,
    latlng: req.body.latlng,
    positon: req.body.position
  },function(err, results){
    if(err){return next(err);}
    res.status(200).send(results[0]);
  });
}