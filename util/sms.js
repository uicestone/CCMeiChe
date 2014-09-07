var config = require('config');
var request = require('request');

exports.send = function(phone, code, callback){
  console.log("send sms ",phone,code);
  request.post("http://yunpian.com/v1/sms/tpl_send.json", {
    form:{
      apikey: config.yunpian.apikey,
      mobile: phone,
      tpl_id: 1,
      tpl_value: "#code#=" + code + "&#company#=CC美车"
    }
  },callback);
}