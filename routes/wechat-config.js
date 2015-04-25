var WXConfig = require("../util/wxconfig");
var domain = require("domain");


module.exports = function(req, res, next){
    
      
  var d = domain.create();
  d.on('error', function(err) {
    console.error(err);
    res.send(404, err.message);
  });

  d.run(function() {
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
  });
}