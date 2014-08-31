var config = require('config');
var request = require('request');

exports.send = function(phone, code, callback){
  console.log("send sms ",phone,code);
  request.get("http://yunpian.com/v1/sms/tpl_send.json", {
    form:{
      apikey: config.yunpian.apikey,
      mobile: phone,
      tpl_id: 1,
      tpl_value: "#code#=" + phone + "&#company#=CC美车"
    }
  },callback);
}

// weimi
// exports.send = function(phone, code, callback){
//   console.log("send sms ",phone,code);
//   request.post("http://api.weimi.cc/2/sms/send.html", {
//     form:{
//       cid: config.get("weimi.cid"),
//       uid: config.get("weimi.uid"),
//       pas: config.get("weimi.pas"),
//       p1: code,
//       mob: phone,
//       type:'json'
//     }
//   },callback);
// }