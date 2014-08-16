var Order = require("../model/order");

module.exports = function(req,res,next){
  Order.find({
    phone: req.user.phone
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }
    res.render('myorders',{
      id:"myorders",
      data:orders,
      moment: require('moment')
    });
  });
}