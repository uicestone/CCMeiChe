(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _4 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _5 = "ccmeiche@0.1.0/pages/mod/input-clear.js";
var _6 = "ccmeiche@0.1.0/pages/mod/menu.js";
var _7 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _9 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _11 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _12 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _13 = "ccmeiche@0.1.0/pages/myinfos.js";
var _14 = "ccmeiche@0.1.0/pages/myorders.js";
var _15 = "ccmeiche@0.1.0/pages/order-result.js";
var _16 = "ccmeiche@0.1.0/pages/order.js";
var _17 = "ccmeiche@0.1.0/pages/promos.js";
var _18 = "ccmeiche@0.1.0/pages/recharge.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/agreement.html.js";
var _21 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _22 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _23 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _24 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _25 = "ccmeiche@0.1.0/pages/views/agreement.js";
var _26 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _27 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _28 = "zepto@^1.1.3";
var _29 = "util@^1.0.4";
var _30 = "events@^1.0.5";
var _31 = "view-swipe@~0.1.4";
var _32 = "tpl@~0.2.1";
var _33 = "hashstate@~0.1.0";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25,_26,_27];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_25, [_28,_11,_20], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var swipeModal = require("../mod/swipe-modal");

module.exports = swipeModal.create({
  button: $(".addcar"),
  template:  require("../tpl/agreement.html"),
  show: function(data){
    var elem = this.elem;
    var content = window.agreement.replace(/\n/,"<br />");
    var contentel = this.elem.find(".content");
    contentel.html(content);
    contentel.css('height', $(window).height() - 152 );
  }
});
}, {
    entries:entries,
    map:mix({"../mod/swipe-modal":_11,"../tpl/agreement.html":_20},globalMap)
});

define(_11, [_29,_30,_31,_32,_33,_28], function(require, exports, module, __filename, __dirname) {
var util = require("util");
var events = require("events");
var viewSwipe = require("view-swipe");
var tpl = require("tpl");
var hashState = require('hashstate')();
var $ = require("zepto");

var i = 1;


function SwipeModal(config){
  var self = this;
  var getData = this.getData = config.getData;
  var validate = this.validate = config.validate || function(){return true};
  var button = this.button = config.button;
  this.submitting = false;
  this.config = config;
  this.name = config.name || "swipe-modal-" + i;
  this._show = config.show;
  i++;

  hashState.on('hashchange', function(e){
    if(!e.newHash){
      viewReturn();
    }
  });

  function viewReturn(){
    hashState.setHash("");
    $("body>.container,body>.wrap").css("display","block");
    $("body").css("position","fixed");
    $(".swipe-container").css("position","fixed");
    setTimeout(function(){
      $("body").css("position","");
    },300);

    viewSwipe.out("bottom");
    button.prop("disabled",false);
  }

  function viewCome(){
    var elem = self.elem;
    setTimeout(function(){
      $("body>.container,body>.wrap").css("display","none");
      $(".swipe-container").css("position","relative");
    },300);
    viewSwipe.in(elem[0],"bottom");
    button.prop("disabled",true);
  }

  self.on("show",viewCome);
  self.on("submit",viewReturn);
  self.on("cancel",viewReturn);

}

util.inherits(SwipeModal,events);
SwipeModal.prototype.santitize = function(data){
  return (this.config.santitize || function(v){return v}).bind(this)(data);
}
SwipeModal.prototype.show = function(data){
  data = this.santitize(data);
  var self = this;
  var config = this.config;
  var submit = config.submit;
  var cancel = config.cancel;
  var elem = this.elem = $(tpl.render(config.template,data));
  elem.find(".submit").on("tap",function(){
    if(self.submitting){return}
    self.submitting = true;
    var data = self.getData();
    var isValid = self.validate(data);

    if(isValid){
      if(!submit){
        self.emit("submit",data);
        self.submitting = false;
      }else{
        submit.bind(self)(data,function(result){
          self.emit("submit",result);
          self.submitting = false;
        });
      }
    }
  });

  elem.find(".cancel").on("tap", function(){
    self.emit("cancel");
  });

  hashState.setHash(this.name);
  this.emit("show");
  this._show && this._show(data);
}

exports.create = function(config){
  return new SwipeModal(config);
}
}, {
    entries:entries,
    map:globalMap
});

define(_20, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="agreement" class="container"><h2 class="h2">用户协议</h2><div class="content"></div><div class="row"><input type="button" value="返回" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();