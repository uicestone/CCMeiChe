var Order = require("../model/order");
var WXConfig = require("../util/wxconfig");
var config = require("config");
exports.list = function(req,res,next){

  Order.find({
    "worker._id": req.user && req.user._id,
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


    new WXConfig("worker")
    .setDebug(req.WECHAT_DEBUG)
    .setList(['chooseImage','uploadImage'])
    .setUrl(req.url)
    .build(function(err, wxconfig){
      if(err){
        return next(err);
      }
      res.render("order",{
        id:"order",
        order: order,
        wxconfig: wxconfig
      });
    });
  });
}