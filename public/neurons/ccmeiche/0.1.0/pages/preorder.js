(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _5 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _11 = "ccmeiche@0.1.0/pages/myinfos.js";
var _12 = "ccmeiche@0.1.0/pages/myorders.js";
var _13 = "ccmeiche@0.1.0/pages/order.js";
var _14 = "ccmeiche@0.1.0/pages/preorder.js";
var _15 = "ccmeiche@0.1.0/pages/recharge.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _20 = "zepto@^1.1.3";
var _21 = "events@^1.0.5";
var _22 = "util@^1.0.4";
var _23 = "tpl@~0.2.1";
var _24 = "view-swipe@~0.1.4";
var _25 = "moment@^2.7.0";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_14, [_20,_21,_22,_23,_24,_25,_19], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var template = require("./tpl/preorder.html");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");
var moment = require("moment");

function PreOrder(){

}

util.inherits(PreOrder,events);

function addZero(num){
  return num < 10 ? ("0" + num) : num;
}

function formatTime(data){
  var milliseconds = data.drive_time + data.wash_time;
  var duration = moment.duration({milliseconds:milliseconds});
  var hours = duration.hours ? ( addZero(duration.hours()) + "小时" ) : "";
  return hours + addZero(duration.minutes()) + "分钟" + addZero(duration.seconds()) + "秒";
}

PreOrder.prototype.show = function(data){
  if(!data.drive_time || !data.wash_time){
    throw "data.drive_time and data.wash_time are required";
  }
  data.time = formatTime(data);
  var html = tpl.render(template,data);
  var elem = $(html);
  var self = this;
  viewSwipe.in(elem[0],"bottom");

  elem.find(".submit").on("touchend", function(){
    self.confirm();
  });

  elem.find(".cancel").on("touchend", function(){
    viewSwipe.out("bottom");
  });
  return this;
}

PreOrder.prototype.confirm = function(data){
  viewSwipe.out("bottom");
  this.emit("confirm");
}

module.exports = new PreOrder();
}, {
    entries:entries,
    map:mix({"./tpl/preorder.html":_19},globalMap)
});

define(_19, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="preorder" class="container"><h2 class="h2">提交订单</h2><div class="order"><div class="inner"><div class="row"><div class="label">手机：</div><div class="text">@{it.phone}</div></div><?js it.cars.forEach(function(car,index){ ?><div class="row"><div class="label">车型：</div><div class="text"><p>@{car.type}</p><p>@{car.number}</p></div></div><?js }); ?><div class="row"><div class="label">地址：</div><div class="text">@{it.address} @{it.carpark}</div></div><div class="row"><div class="label">服务：</div><div class="text">@{it.service.title}</div></div></div></div><h2 class="h2">预估时间</h2><div class="estimate"><div class="time">@{it.time}</div><div class="text"><p>我们将在预估时间内完成洗车，预估时间以付款后为准</p><p>您也可在我们达到前随时取消订单</p></div></div><h2 class="h2">应付金额<div class="price">￥@{it.price}</div></h2><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();