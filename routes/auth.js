
module.exports = function(req,res,next){
  var user_oauth = require("../util/wechat").user.oauth;
  var config = require("config");

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