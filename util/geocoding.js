var config = require('config');
var request = require('request');
var qs = require('querystring');
var md5 = require('MD5');
var ak = config.get("map.ak");
var sk = config.get("map.sk");


function generateSn(data){
  var keys = qs.stringify(data);
  var url = '/geocoder/v2/';
  return md5(encodeURIComponent(url + '?' + keys + sk));
}

function fromAddressToLatlng(address,callback){
  var url = "http://api.map.baidu.com/geocoder/v2/?";
  var data = {
    address: address,
    output: "json",
    ak: ak
  };
  data.sn = generateSn(data);
  url += qs.stringify(data);

  console.log(url);

  request.get(url, function(err, resp, body){
    callback(err, body);
  });
}

function fromLatlngToAddress(){

}


// fromAddressToLatlng("安化路492号", function(err,data){
//   console.log(JSON.parse(data));
// });