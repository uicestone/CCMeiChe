var redis = require('../redis');
var wechat = require('wechat');
var payment = require('wechat-payment');
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

var pay_request = function(ip, order){
  var notify_url = config.wechat.user.notify_url;
  var order_id = order._id;
  var total_price = order.price;
  var order_name = order.service.title + " * " + order.cars.length;

  var package_data = {
    'bank_type':'WX',
    'body': order_name,
    'partner': config.wechat.user.partner_id,
    'out_trade_no': order_id,
    'total_fee': (total_price * 100).toString(),
    'fee_type':'1',
    'notify_url': notify_url,
    'spbill_create_ip':ip,
    'input_charset':'UTF-8'
  };

  var payment = new Payment(
    config.wechat.user.id,
    config.wechat.user.pay_sign_key,
    config.wechat.user.partner_id,
    config.wechat.user.partner_key
  );

  return payment.getWCPayRequest(package_data);
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
