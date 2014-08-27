(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _5 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _10 = "ccmeiche@0.1.0/pages/myinfos.js";
var _11 = "ccmeiche@0.1.0/pages/myorders.js";
var _12 = "ccmeiche@0.1.0/pages/order.js";
var _13 = "ccmeiche@0.1.0/pages/preorder.js";
var _14 = "ccmeiche@0.1.0/pages/recharge.js";
var _15 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _19 = "zepto@^1.1.3";
var _20 = "events@^1.0.5";
var _21 = "util@^1.0.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_7, [_19,_20,_21,_8,_6], function(require, exports, module, __filename, __dirname) {
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
      singleSelect(choices_elem,".item");
      break;
    case "multi":
      multiSelect(choices_elem,".item");
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
  // container.hide();
};

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
}, {
    entries:entries,
    map:mix({"./singleselect":_8,"./multiselect":_6},globalMap)
});

define(_8, [_19,_20,_21], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var events = require("events");
var util = require("util");

function SingleSelect(elem,selector){
  var self = this;
  (function(){
    var current = null;
    var items = self.items = elem.find(selector);
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

module.exports = function(elem,selector){
  return new SingleSelect(elem,selector);
}
}, {
    entries:entries,
    map:globalMap
});

define(_6, [_19], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function MultiSelect(container,itemSelector){
  container = $(container);
  var items = this.items = container.find(itemSelector);
  items.each(function(i,item){
    $(item).on("touchend",function(){
      $(this).toggleClass("active");
    })
  });
  return this;
}

MultiSelect.prototype.select = function(text){
  this.items.filter(function(i){return $(this).text().trim() == text}).addClass("active");
};


module.exports = function(container,itemSelector){
  return new MultiSelect(container,itemSelector);
}
}, {
    entries:entries,
    map:globalMap
});
})();