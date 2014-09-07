var $ = require("zepto");
var template = require("./tpl/preorder.html");
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
  data.time = formatTime(order);
  var html = tpl.render(template,data);
  var elem = $(html);
  var self = this;
  viewSwipe.in(elem[0],"bottom");

  elem.find(".submit").on("touchend", function(){
    this.emit("confirm",order);
    viewSwipe.out("bottom");
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel",order,"preorder_cancel");
    viewSwipe.out("bottom");
  });
  return this;
}


module.exports = new PreOrder();