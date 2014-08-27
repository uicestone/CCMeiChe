var $ = require("zepto");
var singleSelect = require("./singleselect");
var multiSelect = require("./multiselect");
var events = require("events");
var util = require("util");

function PopSelect(choices, options){
  this.parser = options.parser || function(v){return v;}
  this.choices = choices;
  this.type = options.type;
  this.render();

}

util.inherits(PopSelect,events);


PopSelect.prototype.render = function() {
  var parser = this.parser;
  var container = this.container = $("<div class='popselect'>"
      +"<div class='close'></div>"
      +"<div class='choices'></div>"
    +"<div class='btn submit'>确认</div>"
  +"</div>");

  container.appendTo($("body"));
  var self = this;
  var choices_elem = container.find(".choices");
  this.choices.forEach(function(choice){
    var text = parser(choice);
    var item = $("<div class='item'>" + text + "</div>");
    item.data("data",choice);
    choices_elem.append(item);
  });

  switch(this.type){
    case "single":
      this.selector = singleSelect(choices_elem,".item");
      break;
    case "multi":
      this.selector = multiSelect(choices_elem,".item");
      break;
    default:
      throw "invalid type " + this.type;
  }

  container.find(".submit").on("touchend",function(){
    var result = container.find(".active").map(function(i,el){
      return $(el).data("data");
    });

    self.emit("submit", Array.prototype.slice.call(result));
    self.close();
  });

  container.find(".close").on("touchend",function(){
    self.close();
  });
  container.hide();
};

PopSelect.prototype.select = function(item){
  this.selector.select(item);
}

PopSelect.prototype.open = function(){
  this.container.show();
  this.emit("open");
}

PopSelect.prototype.close = function(){
  this.container.hide();
  this.emit("close");
}

module.exports = function(choices,options){
  return new PopSelect(choices,options);
}