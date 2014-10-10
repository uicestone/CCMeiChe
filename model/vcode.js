var redis = require("../redis");
var logger = require("../logger");

function _generateRedisKey(pair, callback){
  return "vcode:" + pair.code + ":" + pair.key;
}

function _codeExists(code,callback){
  redis.keys("vcode:" +  code + ":*", function(err, results){
    if(err){return callback(err);}
    callback(null,!!results.length);
  });
}

function _getRedisKey(key,callback){
  redis.keys("vcode:*" + key, function(err, results){
    if(err){return callback(err);}
    callback(null,results[0]);
  });
}

exports.verify = function(pair, callback){
  var redis_key = _generateRedisKey(pair);
  redis.get(redis_key, function(err, value){
    if(err){return callback(err);}
    var json = JSON.parse(value);
    var expire = json && json.expire;
    if(!expire){
      logger.debug(redis_key + ' not exists');
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
        var timeout = 90;
        var expire = +new Date() + timeout * 1000;
        var redis_key = _generateRedisKey({
          code: code,
          key: key
        });
        var value = JSON.stringify({
          expire: expire,
          key: key,
          code: code
        });
        redis.set(redis_key, value, function(err){
          if(err){return callback(err);}
          redis.expire(redis_key, timeout, function(err){
            if(err){return callback(err);}
            callback(null, code);
          });
        });
      }
    });
  }


  _getRedisKey(key, function(err, redis_key){
    if(err){return callback(err);}
    if(redis_key){
      redis.get(redis_key,function(err,value){
        if(err){return callback(err);}
        callback(null, JSON.parse(value).code);
      });
    }else{
      _generateCode(key, callback);
    }
  });
}