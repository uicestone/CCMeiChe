var estimate = require("../../util/estimate").getSolution;
var _ = require("underscore");


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

  estimate(user_latlng, function(err, result){
    if(err){
      return next(err);
    }

    res.status(200).send(result);
  });

}