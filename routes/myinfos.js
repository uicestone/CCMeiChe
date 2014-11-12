var Service = require('../model/service');
var _ = require('underscore');

module.exports = function(req,res,next){
  var user = req.user;

  user.addresses = (user.addresses || []).map(function(addr){
    var latlng = addr.latlng;
    if(_.isString(latlng)){
      console.log(addr,latlng,typeof latlng);
      latlng = latlng.split(",");
    }

    addr.latlng = latlng;
    return addr;
  });

  Service.find().sort({
    _id: 1
  }).toArray(function(err, promos){
    if(err){return next(err);}

    var user_promos = req.user.promo || [];

    promos.forEach(function(promo){

      var userpromo = user_promos.filter(function(p){
        return p._id == promo._id;
      });

      promo.amount = userpromo[0] ? userpromo[0].amount : 0;
    });

    res.render('myinfos',{
      id: "myinfos",
      promos: promos
    });
  });

}