var redis = require('../redis');
var wechat = require('./wechat');
var request = require('request');
var async = require('async');
var util = require('util');
var config = require('config');

var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名算法
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须与调用 JSAPI 时的页面 URL 完全一致
*
* @returns
*/
var sign = function (jsapi_ticket, url) {
  var ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };


  var string = raw(ret);
      jsSHA = require('jssha');
      shaObj = new jsSHA(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');

  return ret;
};


function WXConfig(service){
  this.serviceName = service;
  this.host = config.host[service];
  this.api = wechat[service] && wechat[service].api;
  this.debug = false;
  this.list = [];
  this.appid = config.wechat[service] && config.wechat[service].id;
}

WXConfig.prototype.setDebug = function(debug){
  this.debug = !!debug;
  return this;
}

WXConfig.prototype.setList = function(list){
  this.list = list;
  return this;
}

WXConfig.prototype.setUrl = function(url){
  this.url = this.host + url;
  return this;
}

WXConfig.prototype._getJsTicket = function(result, callback){
  var url = util.format("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi", result.accessToken);
  var cache_key = this.serviceName + ":jsticket";

  redis.get(cache_key, function(err, value){
    if(err){return callback(err);}
    if(value){return callback(null,value);}

    console.log("GET", url);
    request.get(url, function(err, response, body){
      if(err){
        return callback(err);
      }
      var json = {};
      try{
        json = JSON.parse(body);
      }catch(e){
        return callback(new Error("Error Parse JSON"));
      }

      var ticket = json.ticket;
      var expire = json.expires_in;

      console.log("EXPIRE", expire, typeof expire);
      redis.set(cache_key, ticket, function(err){
        if(err){return callback(err);}
        redis.expire(cache_key, expire, function(err){
          if(err){return callback(err);}
          callback(null, ticket);
        });
      });
    });
  });
}

WXConfig.prototype.build = function(callback){
  var url = this.url;
  var api = this.api;
  var self = this;

  if(!self.appid){
    return callback(new Error("appid missing"));
  }

  async.waterfall([
    api.getAccessToken.bind(api),
    this._getJsTicket.bind(this),
    function(jsTicket, done){
      console.log("JSTICKET", jsTicket);
      done(null, sign(jsTicket, url));
    }
  ], function(err, sign){
    if(err){
      return callback(err);
    }

    console.log("URL", url);
    console.log("RESULT", sign);

    callback(null, {
      debug : self.debug,
      appId: self.appid, // 必填，公众号的唯一标识
      timestamp: sign.timestamp, // 必填，生成签名的时间戳
      nonceStr: sign.nonceStr, // 必填，生成签名的随机串
      signature: sign.signature,// 必填，签名，见附录1
      jsApiList: self.list // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
  });

}

module.exports = WXConfig;
