var wechat = require('wechat');
var config = require('config');

exports.user = wechat(config.wechat.user.token, function(req,res){
  var message = req.weixin;
  console.log(message);
  if(message.Event == "subscribe"){
    res.reply("欢迎关注CC美车 \\(^o^)/");
  }
});

var Worker = require('./model/worker');
var Order = require('./model/order');
exports.worker = wechat(config.wechat.worker.token, function(req,res,next){
  var message = req.weixin;
  var openid = message.FromUserName;
  Worker.findOne({
    openid: openid
  },function(err,user){
    if(err){
      return res.reply(err);
    }
    if(!user){
      return res.reply("您没有权限进行该操作，请管理员添加用户");
    }

    if(message.Event == "LOCATION"){
      Worker.update({
        openid: openid
      },{
        $set:{
          latlng:[messag.Latitude,message.Longitude]
        }
      });
      return;
    }

    if(message.EventKey == "ON_DUTY"){
      // 上班
      if(user.status == "on_duty"){
        return res.reply("你已经在上班了，好好干！");
      }
      Worker.findOne({
        openid: openid
      },function(err, worker){
        if(err){return res.reply(err)}
        var now = new Date();
        var last_abailable_time;
        if(worker.last_abailable_time && worker.last_abailable_time > now){
          last_abailable_time = worker.last_abailable_time;
        }else{
          last_abailable_time = now;
        }
        Worker.update({
          openid: openid
        },{
          $set:{
            last_abailable_time: last_abailable_time,
            status:"on_duty"
          }
        },function(err){
          if(err){return res.reply(err);}
          return res.reply("你已经在上班了，好好干！");
        });
      });
    }else if(message.EventKey == "OFF_DUTY"){
      // 下班
      if(user.status == "off_duty"){
        return res.reply("你已经下班了，享受生活把。");
      }

      Worker.update({
        openid: openid
      },{
        $set:{
          status:"off_duty",
          last_abailable_time: null
        }
      },function(err){
        if(err){return res.reply(err);}
        return res.reply("你已经下班了，享受生活把。");
      });
    }else if(message.EventKey == "VIEW_HISTORY"){
      Order.find({
        worker:"",
        status:"done"
      }).limit(15).toArray(function(err,orders){
        return res.reply(orders.map(function(order){
          var cars = order.cars.map(function(){
            return [car.number,car.type];
          }).join("\n");
          return [order.address,cars]
        }).join("\n\n"))
      });
    }
  });
});