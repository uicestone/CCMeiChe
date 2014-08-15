var config = require('config');
var api = require('../util/wechat').api;

// create menu
var menu = {
  "button": [{
    "type": "view",
    "name": "我要洗车",
    "url": config.host
  },{
    "type": "view",
    "name": "优惠活动",
    "url": config.host + "/promos"
  },{
    "type": "view",
    "name": "我的订单",
    "url": config.host + "/myorders"
  }]
};

api.createMenu(menu, function (err, data, response) {
  console.log("Menu Created", data);
  process.exit(0);
});
