var $ = require("zepto");
var events = require("events");
var util = require("util");

function SingleSelect(selector){
  var self = this;
  (function(){
    var current = null;
    var items = self.items = $(selector);
    items.on("touchend",function(){
      var me = $(this);
      if(me == current){
        me.removeClass("active");
        current = null;
      }else{
        current && current.removeClass("active");
        me.addClass("active");
        current = me;
      }
      self.emit("change",this);
    });
  })();
  return this;
}

util.inherits(SingleSelect,events);

SingleSelect.prototype.select = function(index){
  this.items.eq(index).trigger("touchend");
}

module.exports = function(selector){
  return new SingleSelect(selector);
}