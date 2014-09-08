var redis = require('../redis');
var wechat = require('wechat');
var config = require('config');
var Payment = require('wechat-payment').Payment;
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
  var order_id = order.id;
  var total_price = order.price;
  var order_name = order.name;
  var order_attach = order.attach ? JSON.stringify(order.attach) : '';

  var package_data = {
    'bank_type':'WX',
    'body': order_name,
    'attach': order_attach,
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
var DEBUG = !!process.env.DEBUG;

function notifyProxy(service){
  return {
    sendText: function(openid, message, callback){
      var Notification = require('node-notifier');
      var notifier = new Notification();
      notifier.notify({
        title: service + ' ' + openid,
        sound: "Funk",
        message: message
      });
      callback(null);
    }
  }
}

exports.user = {
  pay_request: pay_request,
  api: DEBUG ? notifyProxy("user") : user_api,
  oauth: user_oauth
};

exports.worker = {
  api: DEBUG ? notifyProxy("worker") : worker_api,
  oauth: worker_oauth
};
