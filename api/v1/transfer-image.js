var config = require('config');
var qiniu = require('qiniu');
var async = require('async');
var temp = require('temp');
var userApi = require('../../util/wechat').user.api;
var fs = require('fs');

exports.post = function(req,res){

  var serverId = req.body.serverId;

  var key = ["wechat",req.user.phone,+new Date()].join("/") + ".jpg";


  var temp_path = temp.path({suffix: '.jpg'});

  console.log("TEMP_PATH", temp_path);
  function getUpToken(){
    var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
    putPolicy.expires = 30;
    return putPolicy.token();
  }

  async.waterfall([
    function(done){
      userApi.getMedia(serverId, function(err, data){
        if(err){return done(err);}
        fs.writeFile(temp_path, data, done);
      });
    },
    function(done){
      var uptoken = getUpToken();
      var extra = new qiniu.io.PutExtra();

      qiniu.io.putFile(uptoken, key, temp_path, extra, function(err, ret) {
        if(err) {
          return done(err);
        } else {
          return done(null, ret);
        }
      });
    }
  ], function(err, reply){
    if(err){return next(err);}
    console.log(reply);
    return res.send(200, reply);
  });
}