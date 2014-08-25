var $ = require("zepto");
var template = require("./tpl/finishorder.html");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");
var singleSelect = require("./mod/singleselect");

function FinishOrder(){

}

util.inherits(FinishOrder,events);

FinishOrder.prototype.show = function(data){
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

  singleSelect(".car-broke");

  return this;
}

FinishOrder.prototype.confirm = function(data){
  viewSwipe.out("bottom");
  this.emit("confirm");
}

module.exports = new FinishOrder();