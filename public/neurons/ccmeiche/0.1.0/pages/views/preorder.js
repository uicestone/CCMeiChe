(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _3 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _4 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _5 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _6 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _9 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _10 = "ccmeiche@0.1.0/pages/myinfos.js";
var _11 = "ccmeiche@0.1.0/pages/myorders.js";
var _12 = "ccmeiche@0.1.0/pages/order.js";
var _13 = "ccmeiche@0.1.0/pages/recharge.js";
var _14 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _15 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _19 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _20 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _21 = "zepto@^1.1.3";
var _22 = "events@^1.0.5";
var _23 = "util@^1.0.4";
var _24 = "tpl@~0.2.1";
var _25 = "view-swipe@~0.1.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_20, [_21,_22,_23,_24,_25,_17], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var template = require("../tpl/preorder.html");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");

function PreOrder(){

}

formatTime({
  preorder_time: new Date(),
  estimated_finish_time: new Date(2014,9,7,6,50,2)
})

util.inherits(PreOrder,events);

function addZero(num){
  return num < 10 ? ("0" + num) : num;
}

function formatTime(order){
  var preorder_time = order.preorder_time;
  var estimated_finish_time = order.estimated_finish_time;

  var hour = 1000 * 60 * 60;
  var minute = 1000 * 60;
  var second = 1000;

  var milliseconds = new Date(estimated_finish_time) - new Date(preorder_time);

  var hours = Math.floor(milliseconds / hour);
  milliseconds = milliseconds - hours * hour;
  var minutes = Math.floor(milliseconds / minute);
  milliseconds = milliseconds - minutes * minute;
  var seconds = Math.floor(milliseconds / second);

  hours = hours ? ( addZero(hours) + "小时" ) : "";
  return hours + addZero(minutes) + "分钟" + addZero(seconds) + "秒";
}



PreOrder.prototype.show = function(order){
  var data = {};
  for(var k in order){
    data[k] = order[k];
  }
  data.time = formatTime(data);
  var html = tpl.render(template,data);
  var elem = $(html);
  var self = this;
  viewSwipe.in(elem[0],"bottom");

  elem.find(".submit").on("touchend", function(){
    self.emit("confirm",order);
    viewSwipe.out("bottom");
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel",order,"preorder_cancel");
    viewSwipe.out("bottom");
  });
  return this;
}


module.exports = new PreOrder();
}, {
    entries:entries,
    map:mix({"../tpl/preorder.html":_17},globalMap)
});

define(_17, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="preorder" class="container"><h2 class="h2">提交订单</h2><div class="order"><div class="inner"><div class="row"><div class="label">手机：</div><div class="text">@{it.user.phone}</div></div><?js it.cars.forEach(function(car,index){ ?><div class="row"><div class="label">车型：</div><div class="text"><p>@{car.type}</p><p>@{car.number}</p></div></div><?js }); ?><div class="row"><div class="label">地址：</div><div class="text">@{it.address} @{it.carpark}</div></div><div class="row"><div class="label">服务：</div><div class="text">@{it.service.title}</div></div></div></div><h2 class="h2">预估时间</h2><div class="estimate"><div class="time">@{it.time}</div><div class="text"><p>我们将在预估时间内完成洗车，预估时间以付款后为准</p><p>您也可在我们达到前随时取消订单</p></div></div><h2 class="h2">应付金额<div class="price">￥@{it.price}</div></h2><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();