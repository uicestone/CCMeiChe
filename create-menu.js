var config = require("config");
var service = process.env.SERVICE;

if(service == "worker"){
var worker_api = require('./util/wechat').worker.api;
var worker_menu = {
  "button": [
    {
      "name": "打卡",
      "sub_button": [{
        "type": "click",
        "name": "上班啦",
        "key": "ON_DUTY"
      },{
        "type": "click",
        "name": "下班喽",
        "key": "OFF_DUTY"
      }]
    },{
      "name": "订单",
      "sub_button": [{
        "type": "click",
        "name": "历史订单",
        "key": "VIEW_HISTORY"
      },{
        "type": "view",
        "name": "测试订单",
        "url" : config.host.worker + "/orders/53f08240113a19650e000002"
      },{
        "type": "view",
        "name": "退出登录",
        "url" : config.host.worker + "/logout"
      }]
    }
  ]
};
console.log("create menu ", JSON.stringify(worker_menu,null,2));
worker_api.createMenu(worker_menu, function (err, data, response) {
  console.log("Menu Created", err, data);
  process.exit(0);
});
}else if(service == "user"){
// create menu
var user_api = require('./util/wechat').user.api;
var user_menu = {
  "button": [{
    "type": "view",
    "name": "我要洗车",
    "url": config.host.user + '/wechat/'
  },{
    "name": "CC乐享",
    "sub_button": [
      {
        "name": "充值有礼",
        "type": "view",
        "url": config.host.user + "/recharge"
      },
      {
        "name": "服务礼包",
        "type": "view",
        "url": config.host.user + "/packages"
      }
    ]
  },{
    "name": "CC助手",
    "sub_button": [
      {
        "name": "我的订单",
        "type": "view",
        "url": config.host.user + "/myorders"
      },
      {
        "name": "联系我们",
        "type": "view",
        "url": config.host.user + "/contact-us"
      },
      {
        "name": "服务介绍",
        "type": "view",
        "url": config.host.user + "/services"
      }
    ]
  }]
};
console.log("create menu ", JSON.stringify(user_menu,null,2));
user_api.createMenu(user_menu, function (err, data, response) {
  console.log("Menu Created", data);
  process.exit(0);
});
}
