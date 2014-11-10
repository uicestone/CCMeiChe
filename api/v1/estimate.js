var estimate = require("../../util/estimate").getSolution;
var _ = require("underscore");
var ServeRegion = require("../../model/serveregion");
var inside = require('point-in-polygon');

exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;


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

    if(!isInside){
      return next("该位置暂且不在我们的服务范围内");
    }

    estimate(user_latlng, function(err, result){
      if(err){
        return next(err);
      }

      res.status(200).send(result);
    });

  });
}