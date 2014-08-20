var Order = require("../model/order");

module.exports = function(req,res){
  var id = req.params.orderid;

  Order.findById(id,function(err,order){
    if(err){
      return next(err);
    }

    if(!order){
      return res.send(404,"not found");
    }

    // if(order.worker !== req.user._id){
    //   return res.send(403,"not your order");
    // }
    console.log(order);
    res.render("order",{
      id:"order",
      order: order
    });
  });
}