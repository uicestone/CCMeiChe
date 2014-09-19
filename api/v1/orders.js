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
    breakage: req.body.breakage,
    finish_pics: req.body.finish_pics,
    breakage_pics: req.body.breakage_pics
  };
  var worker = req.user;

  Order.findById(req.params.orderid,function(err,order){
    if(err){return next(err);}

    async.series([
      // 给车工发送消息
      function(done){
        Worker.getNextOrder(worker._id, function(err, new_order){
          if(err){return done(err);}
          var url, message;
          if(new_order){
            url = config.host.worker + "/orders/" + new_order._id;
            message = "查看下一笔订单：" + url;
          }else{
            message = "您没有后续订单，请原地等待";
          }
          wechat_worker.sendText(worker.openid, message, done);
        });
      },
      // 给用户发送消息
      function(done){
        var url = config.host.user + "/myorders/" + order._id;
        var message = "您的车已洗完：" + url;
        wechat_user.sendText(order.user.openid,"您的车已洗完：" + url, done);
      },
      // 更新订单状态
      function(done){
        Order.finish(order._id, data, done);
      }
    ],function(err){
      if(err){
        return next(err);
      }

      res.status(200).send({message:"ok"});

    });
  });
}

exports.arrive = function(req,res,next){
  Order.findById(req.params.orderid,function(err, order){
    if(err){return next(err);}

    async.series([
      function(done){
        var message = "车工已到达并开始为您洗车";
        wechat_user.sendText(order.user.openid, message, done);
      },
      function(done){
        Order.arrive(order._id, done);
      }
    ],function(err){
      if(err){
        return next(err);
      }
      res.send("ok");
    })
  });

}