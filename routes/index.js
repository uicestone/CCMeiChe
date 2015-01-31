var wechat = require("../util/wechat");
var Service = require("../model/service");
var getSign = require("../util/sign");
var _ = require("underscore");
var config = require("config");

module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;

  Service.find().sort({
    price: 1
  }).toArray(function(err,services){
    if(err){return next(err);}

    getSign(config.host.user + req.url, function(err, sign){
      if(err){
        return next(err);
      }

      res.render("index",{
        id: "home",
        title: "CC美车",
        services: services,
        wxconfig: {
          debug : !!req.WECHAT_DEBUG,
          appId: config.wechat.user.id, // 必填，公众号的唯一标识
          timestamp: sign.timestamp, // 必填，生成签名的时间戳
          nonceStr: sign.nonceStr, // 必填，生成签名的随机串
          signature: sign.signature,// 必填，签名，见附录1
          jsApiList: ['chooseImage','uploadImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        }
      });
    });
  });
}