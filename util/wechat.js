var redis = require('../redis');
var wechat = require('wechat');
var config = require('config');
var Hashes = require('jshashes');
var MD5 = new Hashes.MD5;
var SHA1 = new Hashes.SHA1;
var random = require('random-js');
var qs = require('querystring');
var API = wechat.API;
var OAuth = wechat.OAuth;

function getToken(store_key){
  return function(done){
    redis.get(store_key, function (err, token) {
      if (err) {
        return err;
      }
      try {
        token = JSON.parse(token);
      } catch (e) {
        token = null;
      }
      console.log("using token",token);
      done(null, token);
    });
  }
}

function setToken(store_key){
  return function(token, done){
    redis.set(store_key, JSON.stringify(token), done);
  }
}

var user_store_key = 'wechat-access-token-user';
var worker_store_key = 'wechat-access-token-worker';

var user_api = new API(config.wechat.user.id, config.wechat.user.secret, getToken(user_store_key), setToken(user_store_key));
var user_oauth = new OAuth(config.wechat.user.id, config.wechat.user.secret);

var user_generate_pay_args = function(ip, order){
  var notify_url = config.wechat.user.notify_url;
  var order_id = order._id;
  var total_price = order.price;
  var order_name = order.service.title + " * " + order.cars.length;

  var package_data = {
    'bank_type':'WX',
    'body': order_name,
    'attach': '',
    'partner': config.wechat.user.partner_id,
    'out_trade_no': order_id,
    'total_fee': (total_price * 100).toString(),
    'fee_type':'1',
    'notify_url': notify_url,
    'spbill_create_ip':ip,
    'input_charset':'UTF-8'
  };

  function build_query(data, encode){
    var arr = [];
    Object.keys(package_data).sort().forEach(function(k){
      var value = package_data[k];
      if(value){
        arr.push( k + "=" + (encode ? encodeURIComponent(value) : value) );
      }
    });
    return arr.join("&");
  }

  var string1 = build_query(package_data);

  var stringSignTemp = string1 + "&key=" + config.wechat.user.partner_key;
  var signValue = MD5.hex(stringSignTemp).toUpperCase();

  var string2 = build_query(package_data, true);
  var package_str = string2 + '&sign=' + signValue;

  var nonce_str = MD5.hex(random.engines.nativeMath,16);
  var timestamp = Math.floor(+new Date() / 1000);

  var pay_sign_data = {
    'appid': config.wechat.user.id,
    'timestamp':timestamp,
    'noncestr':nonce_str,
    'package':package_str,
    'appkey': config.wechat.user.pay_sign_key
  };

  var string1 = build_query(pay_sign_data);
  var pay_sign = SHA1.hex(string1);

  var pay_request_args = {
    'appId': config.wechat.user.id,
    'timeStamp': timestamp,
    'nonceStr': nonce_str,
    'package': package_str,
    'signType': 'SHA1',
    'paySign': pay_sign,
  };

  return pay_request_args;
}

var worker_api = new API(config.wechat.worker.id, config.wechat.worker.secret, getToken(worker_store_key), setToken(worker_store_key));
var worker_oauth = new OAuth(config.wechat.worker.id, config.wechat.worker.secret);



exports.user = {
  generatePayArgs: user_generate_pay_args,
  api: user_api,
  oauth: user_oauth
};

exports.worker = {
  api: worker_api,
  oauth: worker_oauth
};
