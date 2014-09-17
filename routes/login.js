var wechat = require('../util/wechat');
var User = require('../model/user');
module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;
  var redirect = req.query.redirect;
  if(!redirect || redirect == req.url){
    redirect = "/wechat?showwxpaytitle=1";
  }

  if(req.isAuthenticated()){
    return res.redirect(redirect);
  }

  if(process.env.DEBUG){
    return res.render("login",{
      id:"login",
      title: "登录"
    });
  }

  if(!code){
    res.send("code not found");
  }else{
    oauth.getAccessToken(code,function(err, result){
      if(err){return next(err);}
      User.findOne({
        openid: result.data.openid
      },function(err,user){
        if(err){
          return next(err);
        }
        if(user){
          req.login(user,function(err){
            if(err){return next(err);}
            res.locals.user = req.user = user;
            res.redirect("/");
            return;
          });
        }else{
          res.render("login",{
            id:"login",
            title: "登录",
            access_token: result.data.access_token,
            openid: result.data.openid
          });
        }
      });
    });
  }
}