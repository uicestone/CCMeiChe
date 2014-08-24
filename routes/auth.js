var config = require("config");
var Worker = require("../model/worker");

exports.user = function(req,res,next){
  var user_oauth = require("../util/wechat").user.oauth;

  if(!req.isAuthenticated()){
    if(process.env.DEBUG){
      return res.redirect("/login");
    }else{
      var url = user_oauth.getAuthorizeURL(config.host.user + '/login');
      return res.redirect(url);
    }
  }

  res.locals.user = req.user;
  next();
}

exports.worker = function(req,res,next){
  var worker_oauth = require("../util/wechat").worker.oauth;

  if(process.env.DEBUG){
    return Worker.findOne({
      name:"spud"
    },function(err,spud){
      if(err){return next(err);}
      res.locals.user = req.user = spud;
      next();
    });
  }

  if(!req.isAuthenticated()){
    console.log("not authenticated");
    var origin_url = config.host.worker + req.url;
    var auth_url = config.host.worker + '/authworker?redirect=' + encodeURIComponent(origin_url);
    var redirect_url = worker_oauth.getAuthorizeURL(auth_url);
    console.log("will redirect to", redirect_url);
    return res.redirect(redirect_url);
  }

  console.log("req.user",req.user);

  res.locals.user = req.user;
  next();
}