var wechat = require('../util/wechat');

module.exports = function(req,res,next){
  var oauth = wechat.user.oauth;
  var code = req.query.code;

  if(process.env.DEBUG){
    return res.render("login",{
      id:"登录 - CC美车",
      title: "ccmeiche login"
    });
  }

  if(!code){
    res.send("code not found");
  }else{
    oauth.getAccessToken(code,function(err, result){
      if(err){return next(err);}
      res.render("login",{
        id:"登录 - CC美车",
        title: "ccmeiche login",
        access_token: result.data.access_token,
        openid: result.data.openid
      });
    });
  }
}