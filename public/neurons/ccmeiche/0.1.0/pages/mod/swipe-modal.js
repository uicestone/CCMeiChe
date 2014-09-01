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
var _10 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _11 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _12 = "ccmeiche@0.1.0/pages/myinfos.js";
var _13 = "ccmeiche@0.1.0/pages/myorders.js";
var _14 = "ccmeiche@0.1.0/pages/order.js";
var _15 = "ccmeiche@0.1.0/pages/preorder.js";
var _16 = "ccmeiche@0.1.0/pages/recharge.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _21 = "util@^1.0.4";
var _22 = "events@^1.0.5";
var _23 = "view-swipe@~0.1.4";
var _24 = "zepto@^1.1.3";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_10, [_21,_22,_23,_24], function(require, exports, module, __filename, __dirname) {
var util = require("util");
var events = require("events");
var viewSwipe = require("view-swipe");
var $ = require("zepto");


function SwipeModal(config){
  var self = this;
  var submit = config.submit;
  var elem = this.elem = $(config.template);
  var getData = config.getData;
  var validate = config.validate;
  var button = config.button;
  var submit = config.submit;
  this._show = config.show;

  elem.find(".submit").on("touchend",function(){
    var data = this.getData();
    var isValid = this.validate();

    if(isValid){
      if(!submit){
        self.emit("submit",data);
      }else{
        submit(data,function(result){
          viewSwipe.out("bottom");
          self.emit("submit",result);
        });
      }
      viewSwipe.out("bottom");
    }
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel");
    viewSwipe.out("bottom");
  });
}

util.inherits(SwipeModal,events);

SwipeModal.prototype.show = function(){
  this.emit("show");
  viewSwipe.in(this.elem[0],"bottom");
  this._show();
}

exports.create = function(config){
  return new SwipeModal(config);
}
}, {
    entries:entries,
    map:globalMap
});
})();