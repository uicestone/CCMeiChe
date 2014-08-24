var Order = require("../model/order");


exports.list = function(req,res,next){
  Order.find({
    "worker": req.user && req.user._id,
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }

    res.render("myorders",{
      role:"worker",
      id:"myorders",
      data:orders
    });
  })
}

exports.detail = function(req,res,next){
  var id = req.params.orderid;

  Order.findById(id,function(err,order){
    if(err){
      return next(err);
    }

    if(!order){
      return res.send(404,"not found");
    }

    if(order.worker !== req.user._id){
      return res.send(403,"not your order");
    }
    order.status = order.status || "todo";

    res.render("order",{
      id:"order",
      order: order
    });
  });
}