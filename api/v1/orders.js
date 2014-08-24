var model = require('../../model');
var Order = model.order;
var Worker = model.worker;

exports.detail = function(req,res,next){
  Order.findById(req.params.orderid,function(err,order){
    if(err){return next(err);}
    if(!order){return res.send(404,"not found");}
    res.send(order);
  });
}

exports.list = function(req,res,next){
  Order.find({
    worker: req.user._id
  }).toArray(function(err,orders){
    if(err){return next(err);}
    res.send(orders);
  });
}


exports.done = function(req,res,next){
  Order.updateById(req.params.orderid,{
    $set:{
      status: "done",
      finish_time: new Date()
    }
  },function(err, order){
    if(err){
      return next(err);
    }
    Order.findById(req.params.orderid,function(err,order){
      if(err){return next(err);}
      Worker.updateById(req.user._id, {
        last_available_time: new Date(req.user.last_available_time - (order.estimate_finish_time - order.finish_time))
      },function(err){
        if(err){return next(err);}
        res.send("ok");
      });
    });
  });
}

exports.arrive = function(req,res,next){
  Order.updateById(req.params.orderid,{
    $set:{
      status: "doing",
      arrive_time: new Date()
    }
  },function(err){
    if(err){
      return next(err);
    }
    res.send("ok");
  });
}