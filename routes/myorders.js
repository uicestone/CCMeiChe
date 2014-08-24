var Order = require("../model/order");

module.exports = function(req,res,next){
  Order.find({
    "user.phone": req.user.phone
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }
    res.render('myorders',{
      role:"user",
      id:"myorders",
      data:orders
    });
  });
}