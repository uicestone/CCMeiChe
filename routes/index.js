var wechat = require("../util/wechat");
var Service = require("../model/service");
var _ = require("underscore");
var config = require("config");

module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;

  Service.find().toArray(function(err,services){
    if(err){return next(err);}
    services = services.map(function(service){
      return _.omit(service,"_id");
    });
    res.render("index",{
      id: "home",
      title: "CC美车",
      services: services,
      user: req.user
    });
  });
}