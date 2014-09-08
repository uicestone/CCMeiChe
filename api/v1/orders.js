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

  if(!data.finish_pics){
    res.status(400).send("wrong params");
  }

  Order.findById(req.params.orderid,function(err,order){
    if(err){return next(err);}

    async.series([
      // 给车工发送消息
      function(done){
        Order.findOne({
          "worker._id": worker._id.toString(),
          "status":"todo"
        },function(err,new_order){
          if(err){return done(err);}
          if(!new_order){return done(null);}
          var url = config.host.worker + "/orders/" + new_order._id;
          var message = "查看下一笔订单：" + url;
          console.log("send text to %s %s",worker.openid,message);
          wechat_worker.sendText(worker.openid, message, done);
        });
      },
      // 给用户发送消息
      function(done){
        if(!order.user.openid){
          return done("订单 %s 的用户没有openid",order._id);
        }
        var url = config.host.user + "/myorders/" + order._id;
        var message = "您的车已洗完：" + url;
        console.log("send text to %s %s",order.user.openid, message);
        wechat_user.sendText(order.user.openid,"您的车已洗完：" + url, done);
      },
      // 更新车工最后可用时间
      function(done){
        Worker.removeOrder(worker._id, order, done);
      },
      // 更新订单状态
      function(done){
        Order.updateById(order._id,{
          $set:{
            breakage: data.breakage,
            finish_pics: data.finish_pics,
            breakage_pics: data.breakage_pics,
            status: "done",
            finish_time: new Date()
          }
        },done);
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
        console.log("send text to user %s %s",order.user.openid,message);
        wechat_user.sendText(order.user.openid, message, done);
      },
      function(done){
        Order.updateById(order._id,{
          $set:{
            status: "doing",
            arrive_time: new Date()
          }
        }, done);
      }
    ],function(err){
      if(err){
        return next(err);
      }
      res.send("ok");
    })
  });

}