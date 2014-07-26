var models = require("../../model");
var vcode = models.vcode;

exports.post = function(req,res,next){
  var phone = req.body.phone;
  var code = req.body.code;

  vcode.verify({
    code: code,
    key: phone
  },function(err, match){
    if(err){return next();}
    if(match){
      req.session.phone = phone;
      res.send("ok");
    }else{
      res.send(403,"verify failed");
    }
  });
}