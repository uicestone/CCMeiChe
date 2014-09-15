var model = require('../../model');
var User = model.user;

/**
 * 获取车辆
 * @param  number 车牌
 */
exports.get = function (req, res, next) {
  return req.user.cars || [];
};

/**
 * 添加车辆
 * @param  pic 照片
 * @param  types 车型
 * @param  number 车牌
 * @param  color 颜色
 * @param  comment 备注
 */
exports.post = function (req, res, next) {
  var number = req.body.number;
  var pic = req.body.pic;
  var type = req.body.type;
  var color = req.body.color;
  var comment = req.body.comment;
  var index = req.body.index;
  var phone = req.user.phone;
  var car = {
    pic: pic,
    number: number,
    type: type,
    color: color,
    comment: comment
  };

  if (!number) {
    return res.status(400).send("bad request");
  }

  if (index){
    User.modifyCar(phone, index, car, function(err){
      if(err){
        return next(err);
      }
      res.status(200).send({message:"ok"});
    });
  }else{
    User.findOne({
      phone: phone,
      "cars.number": number
    }, function (err, user) {
      if (err) {
        return next(err);
      }

      if (user) {
        return res.status(400).send("您已添加过该车牌");
      }

      if(req.user.cars && req.user.cars.length >= 5){
        return res.status(400).send("无法添加更多车辆");
      }

      if(!req.user.cars || !req.user.cars.length){
        car["default"] = true;
      }

      User.addCar(phone, car, function (err) {
        if (err) {
          return next(err);
        }
        res.status(200).send({message:"ok"});
      });
    });
  }


};