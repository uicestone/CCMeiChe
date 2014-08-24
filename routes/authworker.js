var wechat = require('../util/wechat');
var Worker = require('../model/worker');

module.exports = function(req,res,next){
  var oauth = wechat.worker.oauth;
  var code = req.query.code;
  var redirect = req.query.redirect;

  if(!code){
    return res.send("code not found");
  }

  oauth.getAccessToken(code,function(err, result){
    if(err){return next(err);}
    var openid = result.data.openid;
    var access_token = result.data.access_token;

    Worker.find({
      openid: openid
    },function(err,worker){
      if(err){return next(err);}
      if(!worker){res.status(404).send("worker not signed up");}

      worker.access_token = access_token;
      Worker.update({
        openid: openid
      },worker,function(err){
        if(err){return next(err);}
        req.login(user, function(err){
          if(err){return next(err);}
          return res.redirect(redirect);
        });
      });
    });
  });
}