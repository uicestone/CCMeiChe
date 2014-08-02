var model = require('../../model');
var Car = model.car;

/**
 * 获取车辆
 * @param  number 车牌
 */
exports.get = function(req,res,next){

  Car.findOne({
    number: req.query.number
  },function(err,car){
    if(err){return next(err);}
    if(!car){
      return res.status(404).send("not found");
    }
    res.status(200).send(car);
  });

};

/**
 * 更新车辆
 * @param  types 车型
 * @param  number 车牌
 * @param  color 颜色
 * @param  comment 备注
 */
exports.put = function(req,res,next){
  if(!req.body.number){
    return res.status(400).send("bad request");
  }

  Car.update({
    number: req.body.number
  }, {
    number: req.body.number,
    type: req.body.type,
    color: req.body.color,
    comment: req.body.comment
  }, {
    upsert: true
  },function(err){
    if(err){return next(err);}
    res.status(200).send("ok")
  });
};