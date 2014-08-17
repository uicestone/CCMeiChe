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

    User.update({
      phone:req.user.phone
    },{
      $inc:{
        credit: recharge.price
      },
      $push: {
        promo: recharge.promo
      }
    },function(err,user){
      if(err){return next(err);}
      res.send("ok");
    });
  });
}