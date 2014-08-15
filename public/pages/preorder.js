var $ = require("zepto");
var template = require("./tpl/preorder.html");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");


function PreOrder(){

}

util.inherits(PreOrder,events);

PreOrder.prototype.show = function(data){
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