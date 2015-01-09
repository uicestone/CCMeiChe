var config = require("config");
var Worker = require("../model/worker");

exports.user = function(req,res,next){
  var user_oauth = require("../util/wechat").user.oauth;

  if(!req.isAuthenticated()){
    if(process.env.DEBUG){
      return res.redirect("/login?redirect=" + req.url);
    }else{
      var url = user_oauth.getAuthorizeURL(config.host.user + '/login?redirect=' + req.url);
      return res.redirect(url);
    }
  }

  res.locals.user = req.user;
  next();
}

exports.worker = function(req,res,next){
  var worker_oauth = require("../util/wechat").worker.oauth;

  if(process.env.CCDEBUG){
    Worker.findById(process.env.WORKERID,function(err,worker){
      if(err){return next(err);}
      console.log(worker);
      req.login(worker,function(err){
        if(err){return next(err);}
        res.locals.user = req.user = worker;
        next();
      });
    });
    return
  }


  if(!req.isAuthenticated()){
    console.log("not authenticated");
    var origin_url = config.host.worker + req.url;
    var auth_url = config.host.worker + '/authworker?redirect=' + encodeURIComponent(origin_url);
    var redirect_url = worker_oauth.getAuthorizeURL(auth_url);
    console.log("will redirect to", redirect_url);
    return res.redirect(redirect_url);
  }

  res.locals.user = req.user;
  next();
}