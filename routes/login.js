var wechat = require('../util/wechat');

module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;
  var redirect = req.query.redirect;
  if(!redirect || redirect == req.url){
    redirect = "/";
  }

  if(req.isAuthenticated()){
    res.redirect(redirect);
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
      res.render("login",{
        id:"login",
        title: "登录",
        access_token: result.data.access_token,
        openid: result.data.openid
      });
    });
  }
}