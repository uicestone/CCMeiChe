var redis = require('../../redis');
var logger = require("../../logger");

// 随机生成一个六位数
// redis里面已经有了则重新生成
// 手机号已有了则返回错误
function generateCode(key, callback){
  function _generateCode(key, callback){
    var code = "";
    for(var i = 0; i < 6; i++){
      code += Math.floor(Math.random() * 10);
    }
    redis.keys("vcode:" +  code + ":*", function(err, result){
      if(err){return callback(err);}
      if(result.length){
        _generateCode(key, callback);
      }else{
        var timeout = 30 * 1000;
        var expire = +new Date() + timeout;
        var redis_key = "vcode:" + code + ":" + key;
        setTimeout(function(){
          redis.del(redis_key);
        }, timeout);
        redis.set(redis_key, expire, function(err){
          if(err){return callback(err);}
          callback(null, code);
        });
      }
    });
  }

  redis.keys("vcode:*" + key, function(err, result){
    if(err){return callback(err);}
    if(result.length){
      callback({
        message: "last vcode not expired key:" + key,
        status: 401,
        code: "ERR_LAST_NOT_EXPIRED",
        toString: function(){
          return JSON.stringify(this);
        }
      });
    }else{
      _generateCode(key, callback);
    }
  });
}

/**
 * 获取验证码
 * GET
 * phone
 * 返回未失效的验证码
 */
exports.get = function(req,res,next){
  var phone = req.query.phone;
  if(!phone){
    return res.send(401,"wrong params");
  }

  generateCode(phone, function(err,code){
    if(err){return next(err);}
    console.log('code',code);
    res.send(200,"ok");
  });
 }