var async = require('async');
var config = require('config');
var model = require('../../model');
var Order = model.order;
var Worker = model.worker;
var wechat_user = require('../../util/wechat').user.api;
var wechat_worker = require('../../util/wechat').worker.api;

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
  var data = {
    broken: req.body.broken,
    finish_pics: req.body.finish_pics,
    broken_pics: req.body.broken_pics
  };
  var worker = req.user;

  if(!data.finish_pics){
    res.status(400).send("wrong params");
  }

  Order.updateById(req.params.orderid,{
    $set:{
      broken: data.broken,
      finish_pics: data.finish_pics,
      broken_pics: data.broken_pics,
      status: "done",
      finish_time: new Date()
    }
  },function(err){
    if(err){
      return next(err);
    }

    Order.findById(req.params.orderid,function(err,order){
      if(err){return next(err);}

      async.parallel([
        // 更新车工最后可用时间
        function(done){

          Worker.updateById(worker._id, {
            last_available_time: new Date(worker.last_available_time - (order.estimate_finish_time - order.finish_time))
          },done);

        },
        // 给车工发送消息
        function(done){
          Order.findOne({
            "worker._id": worker._id
          },function(err,new_order){
            if(err){return done(err);}
            if(!new_order){return done(null);}
            var url = config.host.worker + "/orders/" + new_order._id;
            wechat_worker.sendText(worker.openid,"查看下一笔订单：" + url, done);
          });
        },
        // 给用户发送消息
        function(done){
          var url = config.host.user + "/myorders/" + order._id;
          wechat_user.sendText(order.user.openid,"您的车已洗完：" + url);
        }
      ],function(err){
        if(err){
          return next(err);
        }

        res.status(200).send("ok");

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