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