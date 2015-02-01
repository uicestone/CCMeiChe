var wechat = require("../util/wechat");
var Service = require("../model/service");
var WXConfig = require("../util/wxconfig");
var _ = require("underscore");
var config = require("config");

module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;

  Service.find().sort({
    price: 1
  }).toArray(function(err,services){
    if(err){return next(err);}

    new WXConfig("user")
    .setDebug(req.WECHAT_DEBUG)
    .setList(['chooseImage','uploadImage'])
    .setUrl(req.url)
    .build(function(err, wxconfig){
      if(err){
        return next(err);
      }

      res.render("index",{
        id: "home",
        title: "CC美车",
        services: services,
        wxconfig: wxconfig
      });
    });
  });
}