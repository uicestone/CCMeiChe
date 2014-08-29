var config = require('config');
var request = require('request');

exports.send = function(phone, code, callback){
  console.log("send sms ",phone,code);
  request.post("http://api.weimi.cc/2/sms/send.html", {
    form:{
      cid: config.get("weimi.cid"),
      uid: config.get("weimi.uid"),
      pas: config.get("weimi.pas"),
      p1: code,
      mob: phone,
      type:'json'
    }
  },callback);
}