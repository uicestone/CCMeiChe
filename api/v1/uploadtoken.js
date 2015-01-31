var config = require('config');
var qiniu = require('qiniu');
var md5 = require("MD5");

exports.get = function(req,res){
  var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
  putPolicy.expires = 30;

  var fileName = md5([req.user.phone,+new Date()].join(",") ).slice(0,8);
  res.send({
    "token":putPolicy.token(),
    "fileName": fileName
  });
}