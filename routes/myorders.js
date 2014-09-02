var Order = require("../model/order");

exports.list = function(req,res,next){
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

exports.detail = function(req,res,next){
  console.log(req.params.orderid);
  Order.findById(req.params.orderid,function(err,order){
    if(err || !order){
      return next(err);
    }

    res.render('order-result',{
      id:"order-result",
      order: order
    });
  })
}