var config = require("config");
var service = process.env.SERVICE;

var user_api = require('./util/wechat').user.api;
var worker_api = require('./util/wechat').worker.api;

function output(err, json){
  console.log(JSON.stringify(json,null,2));
}

user_api.getMenu(output);
worker_api.getMenu(output);
