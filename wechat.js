var wechat = require('wechat');
var config = require('config');

exports.user = wechat(config.wechat.user.token, function(req,res){
  var message = req.weixin;
  console.log("user wechat recieves message %s",JSON.stringify(message,null,2));
  if(message.Event == "subscribe"){
    res.reply("欢迎关注CC美车 \\(^o^)/");
  }else{
    res.reply("");
  }
});

var Worker = require('./model/worker');
var Order = require('./model/order');
exports.worker = wechat(config.wechat.worker.token, function(req,res,next){
  var message = req.weixin;
  var openid = message.FromUserName;

  console.log("worker wechat recieves message %s",JSON.stringify(message,null,2));
  Worker.findOne({
    openid: openid
  },function(err,user){
    if(err){
      return res.reply(err);
    }
    if(message.Event == "LOCATION"){
      if(user){
        Worker.update({
          openid: openid
        },{
          $set:{
            latlng:[+message.Latitude,+message.Longitude]
          }
        });
      }
      return res.reply("");
    }

    if(message.Event == "subscribe" && !user){
      return res.reply("欢迎加入CC美车，请管理员添加用户" + openid);
    }

    if(message.EventKey && !user){
      return res.reply("您没有权限进行该操作，请管理员添加用户" + openid);
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
        var last_available_time;
        if(worker.last_available_time && worker.last_available_time > now){
          last_available_time = worker.last_available_time;
        }else{
          last_available_time = now;
        }
        Worker.update({
          openid: openid
        },{
          $set:{
            last_available_time: last_available_time,
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
        return res.reply("你已经下班了，享受生活吧。");
      }

      Worker.update({
        openid: openid
      },{
        $set:{
          status:"off_duty",
          last_available_time: null
        }
      },function(err){
        if(err){return res.reply(err);}
        return res.reply("你已经下班了，享受生活吧。");
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
    }else{
      return res.reply("");
    }
  });
});