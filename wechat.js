var redis = require('./redis');
var wechat = require('wechat');
var config = require('config');
var API = wechat.API;
var OAuth = wechat.OAuth;



module.exports = function (app) {

  var menu = {
    "button": [{
      "type": "view",
      "name": "我要洗车",
      "url": "http://192.168.0.80:4272/a"
    },{
      "type": "view",
      "name": "优惠活动",
      "url": "http://192.168.0.80:4272/b"
    },{
      "type": "view",
      "name": "我的订单",
      "url": "http://192.168.0.80:4272/c"
    }]
  };

  function getToken(done){
    redis.get('wechat-access-token', function (err, token) {
      if (err) {
        return err;
      }
      try {
        token = JSON.parse(token);
      } catch (e) {
        token = null;
      }
      done(null, token);
    });
  }

  function setToken(token,done){
    redis.set('wechat-access-token', JSON.stringify(token), done);
  }

  var api = new API(config.wechat.id, config.wechat.secret, getToken, setToken);
  api.createMenu(menu, function (err, data, response) {
    console.log("Menu Created", data);
  });

  return function () {
    app.get('/wechat', function (req, res) {
      res.status(200).send(req.query.echostr);
    });
  }
}