var wechat = require("../util/wechat");
var config = require("config");

module.exports = function(req,res){
  var oauth = wechat.user.oauth;
  var code = req.query.code;
  if(!req.isAuthenticated()){
    var url = oauth.getAuthorizeURL(config.host.user + '/login');
    return res.redirect(url);
  }

  console.log(req.user);

  res.render("index",{
    id: "home",
    title: "CC美车",
    phone: req.user.phone
  });
}