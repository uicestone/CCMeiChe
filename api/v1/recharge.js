var User = require("../../model/user");
var Recharge = require("../../model/recharge");

exports.post = function(req,res,next){
  var price = +req.params.price;
  Recharge.findOne({
    price: price
  },function(err,recharge){
    if(err){return next(err);}
    if(!recharge){
      return res.status(400).send("unexcepted price");
    }

    User.findOne({
      phone: req.user.phone
    },function(err,user){
      if(err || !user){
        return next(err);
      }

      var userpromos = user.promo || [];

      recharge.promo.forEach(function(promo){
        var userpromo = userpromos.filter(function(item){
          return item._id == promo._id;
        })[0];
        if(userpromo){
          userpromo.amount += promo.amount;
        }else{
          promo.amount = promo.amount;
          userpromos.push(promo);
        }
      });

      User.update({
        phone:req.user.phone
      },{
        $inc:{
          credit: recharge.actual_price
        },
        $set: {
          promo: userpromos
        }
      },function(err,user){
        if(err){return next(err);}
        res.send("ok");
      });
    });
  });
}