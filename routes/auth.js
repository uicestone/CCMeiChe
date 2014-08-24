var config = require("config");

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

exports.worker = function(req,res){
  var worker_oauth = require("../util/wechat").worker.oauth;
  if(!req.isAuthenticated()){
    var origin_url = config.host.worker + req.url;
    var auth_url = config.host.worker + '/authworker?redirect=' + encodeURIComponent();
    var redirect_url = worker_oauth.getAuthorizeURL(auth_url);
    return res.redirect(redirect_url);
  }

  res.locals.user = req.user;
}