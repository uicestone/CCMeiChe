var estimate = require("../../util/estimate").getSolution;
var _ = require("underscore");
var ServeRegion = require("../../model/serveregion");
var Service = require("../../model/service");
var inside = require('point-in-polygon');

exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;
  var serviceId = req.body.service_id;
  var cars = req.body.cars;

  // more validations here
  if (!user_latlng) {
    return next({
      status: 400,
      message: "missing latlng"
    });
  }

  var user = req.user;

  user_latlng = user_latlng.split(",").map(function(item){return +item});



  ServeRegion.find().toArray(function(err, regions){
    if(err){
      return next(err);
    }

    var isInside = false;
    regions.forEach(function(r,i){
      if(inside(user_latlng.slice(0).reverse(), r.points)){
        isInside = true;
      }
    });

    if(!isInside && !process.env.CCDEBUG){
      return next("您的坐标(" + user_latlng + ")暂且不在我们的服务范围内");
    }

    // 估算服务耗时，需要用到具体服务的时间
    Service.findById(serviceId, function(err, service){

      estimate(user_latlng, service, cars, function(err, result){
        if(err){
          return next(err);
        }

        res.status(200).send(result);
      });

    });

  });
}