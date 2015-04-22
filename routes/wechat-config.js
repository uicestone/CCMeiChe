var WXConfig = require("../util/wxconfig");

module.exports = function(req, res){

	new WXConfig("user")
    .setDebug(req.WECHAT_DEBUG)
    .setList(['chooseImage','uploadImage'])
    .setUrl(req.headers.referer)
    .build(function(err, wxconfig){
      if(err){
        return next(err);
      }
      if(req.user && req.user.isTest){
        wxconfig.debug = true;
      }
      res.set('Content-Type', 'application/javascript');
      res.send("window.wxconfig = " + JSON.stringify(wxconfig));
    });
}