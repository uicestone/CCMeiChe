var model = require('../../model');
var User = model.user;

/**
 * 获取车辆
 * @param  number 车牌
 */
exports.get = function (req, res, next) {

  User.findByPhone(req.user.phone, function (err, user) {
    if (err) {
      return next(err);
    }
    res.status(200).send(user.address||[]);
  });

};

/**
 * 添加车辆
 * @param  latlng 经纬度
 * @param  address 具体位置
 * @param  carpark 车位
 */
exports.post = function (req, res, next) {

  var data = {
    latlng: req.body.latlng,
    address: req.body.address,
    carpark: req.body.carpark
  };

  var keys = Object.keys(data);
  for(var i = 0 ; i < keys.length; i++){
    if(!data[keys[i]]){
      res.send("missing " + keys[i]);
      break;
    }
  }

  User.findOne({
    phone: phone,
    "address.address": data.address,
    "address.carpark": data.carpark
  }, function (err, user) {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.status(400).send("您已添加过该地址");
    }

    User.update({
      phone: phone
    }, {
      $addToSet: {
        address: data
      }
    }, function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).send("ok");
    });
  });


};