var async = require('async');
var config = require('config');
var model = require('../../model');
var Order = model.order;
var Worker = model.worker;
var User = model.user;
var wechat_user = require('../../util/wechat').user.api;
var sms = require('../../util/sms');
var wechat_worker = require('../../util/wechat').worker.api;
var logger = require('../../logger');
var moment = require('moment');

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
    breakage: req.body.breakage || null,
    finish_pics: req.body.finish_pics || [],
    breakage_pics: req.body.breakage_pics || []
  };
  var worker = req.user;

  if(!data.finish_pics || !data.finish_pics.length){
    return res.status(400).send("请上传车辆照片");
  }

  Order.findById(req.params.orderid,function(err,order){
    if(err){return next(err);}

    req.logger.log(req.user, '完成', order._id);
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
          req.logger.log("系统", "向车工发消息", message);
          wechat_worker.sendText(worker.openid, message, done);
        });
      },
      // 给用户发送消息
      function(done){
        var url = config.host.user + "/myorders/" + order._id;
        var message = "您的车已洗完：" + url;
        logger.debug(data);
        var news = order.cars.map(function(car,i){
          var description = car.type + order.address + order.service.title + "已经完成，点击查看详情";
          req.logger.log("系统", "构建消息", description);
          return {
            title: "您的服务已完成",
            description: description,
            url: url,
            picurl: config.qiniu.host + data.finish_pics[i][0]
          }
        });
        wechat_user.sendNews(order.user.openid, news, function(err){
          if(err){
            req.logger.log("系统", "发送完成消息失败", "转为手机短信发送");
          }

          var smsContent = order.cars.map(function(car){
            return car.type + order.address + order.service.title;
          }).join("，") + "已经完成，请在服务号中查看详情";
          sms.send(order.user.phone, smsContent, function(err,resp,data){
            if(err){
              req.logger.log("系统", "短信发送失败", JSON.stringify(data));
            }else{
              req.logger.log("系统", "短信发送成功");
            }
          });
          done(null);
        });
      },
      // 更新用户默认车辆
      function(done){
        req.logger.log("系统", "更新用户默认车辆", "");
        var cars = order.cars.map(function(car, i){
          return {
            number: car.number,
            pics: data.finish_pics[i]
          };
        });
        User.updateCarPic(order.user._id, cars, done);
      },
      // 更新订单状态
      function(done){
        req.logger.log("系统", "更新订单状态", order._id);
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
    var userOpenId = order.user.openid;
    var workerOpenId = order.worker.openid;

    async.series([
      function(done){
        var message;
        if(order.service.needopen){
          message = "您的CC美车管家已经到达，麻烦您解锁爱车，并取走车上贵重物品。谢谢您的配合。";
        }else{
          message = "您的CC美车管家已经到达并已开始作业，请耐心等候。";
        }
        req.logger.log("系统", "向用户发送消息", JSON.stringify({
          openId: userOpenId,
          message: message
        }));
        wechat_user.sendText(userOpenId, message, function(err){
          if(err){
            req.logger.log("系统", "向用户发送消息失败", err);
          }
        });
        done(null);
      },
      function(done){
        // 更新车工最后可用时间
        console.log("estimated_finish_time", order.estimated_finish_time);
        console.log("estimated_arrive_time", order.estimated_arrive_time);
        var wash_time = new Date(order.estimated_finish_time) - new Date(order.estimated_arrive_time);
        console.log("wash_time", wash_time);
        var last_available_time = new Date(+new Date() + wash_time);
        req.logger.log("系统", "更新车工可用时间", JSON.stringify({
          name: req.user.name,
          time: moment(last_available_time).format("lll")
        }));
        console.log("openid", workerOpenId);
        console.log("last_available_time", last_available_time);
        Worker.update({
          openid: workerOpenId
        },{
          $set:{
            last_available_time: last_available_time
          }
        },done);
      },
      function(done){
        req.logger.log(req.user, '到达', order._id);
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