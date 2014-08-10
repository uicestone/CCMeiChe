var wechat = require('wechat');
var config = require('config');

module.exports = wechat(config.wechat.user.token, function(req,res){
  var message = req.weixin;
  console.log(message);
  if(message.Event == "subscribe"){
    res.reply("欢迎关注CC美车 \\(^o^)/");
  }
});