var redis = require("../redis");

function _generateRedisKey(pair, callback){
  return "vcode:" + pair.code + ":" + pair.key;
}

function _codeExists(code,callback){
  redis.keys("vcode:" +  code + ":*", function(err, results){
    if(err){return callback(err);}
    callback(null,!!results.length);
  });
}

function _keyExists(key,callback){
  redis.keys("vcode:*" + key, function(err, results){
    if(err){return callback(err);}
    callback(null,!!results.length);
  });
}

exports.verify = function(pair, callback){
  var redis_key = _generateRedisKey(pair);
  redis.get(redis_key, function(err, expire){
    if(err){return callback(err);}
    if(!expire){
      return callback(null, false);
    }
    var ok = +new Date() < expire;
    redis.del(redis_key, function(err){
      if(err){return callback(err);}
      callback(null, ok);
    });
  });
}

// 随机生成一个六位数
// redis里面已经有了则重新生成
// 手机号已有了则返回错误
exports.generate = function(key, callback){
  function _generateCode(key, callback){
    var code = "";
    for(var i = 0; i < 6; i++){
      code += Math.floor(Math.random() * 10);
    }
    _codeExists(code, function(err, exists){
      if(err){return callback(err);}
      if(exists){
        _generateCode(key, callback);
      }else{
        var timeout = 60 * 1000;
        var expire = +new Date() + timeout;
        var redis_key = _generateRedisKey({
          code: code,
          key: key
        });
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


  _keyExists(key, function(err, exists){
    if(err){return callback(err);}
    if(exists){
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