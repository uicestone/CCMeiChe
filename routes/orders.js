var Order = require("../model/order");


exports.list = function(req,res,next){
  Order.find({
    "worker._id": (req.user && req.user._id).toString(),
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
    if(err || !order){
      return next(err);
    }

    // console.log("worker",order.worker, req.user._id,"user");
    if(order.worker._id.toString() !== req.user._id.toString()){
      return res.send(403,"not your order");
    }
    order.status = order.status || "todo";

    res.render("order",{
      id:"order",
      order: order
    });
  });
}