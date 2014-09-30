var Order = require("../model/order");



function calculateTime(order){
  var finish_time = +new Date(order.estimated_finish_time);
  var now = +new Date();
  var duration = finish_time - now;
  var negative = now > finish_time ? "-" : "";
  var minutes =  Math.floor( Math.abs( duration / (1000 * 60)));
  var seconds = Math.round( (Math.abs(duration) - minutes * 1000 * 60) / 1000);
  return negative + addZero(minutes) + ":" + addZero(seconds);
}

function addZero(num){
  return num < 10 ? ("0" + num) : num;
}


exports.list = function(req,res,next){
  Order.find({
    "user._id": req.user._id
  }).sort({
    "estimated_finish_time": -1
  }).toArray(function(err,orders){
    if(err){
      return next(err);
    }
    orders.forEach(function(order){
      order.time = calculateTime(order);
    });
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

    if(order.status !== "done"){
      return res.status(200).send("order status " + order.status);
    }

    res.render('order-result',{
      id:"order-result",
      order: order
    });
  })
}