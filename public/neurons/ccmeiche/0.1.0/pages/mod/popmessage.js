(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _4 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _5 = "ccmeiche@0.1.0/pages/mod/menu.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _11 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _12 = "ccmeiche@0.1.0/pages/myinfos.js";
var _13 = "ccmeiche@0.1.0/pages/myorders.js";
var _14 = "ccmeiche@0.1.0/pages/order.js";
var _15 = "ccmeiche@0.1.0/pages/promos.js";
var _16 = "ccmeiche@0.1.0/pages/recharge.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/agreement.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _21 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _22 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _23 = "ccmeiche@0.1.0/pages/views/agreement.js";
var _24 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _25 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _26 = "zepto@^1.1.3";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_7, [_26], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
function popMessage(message){
  var json = {}
  if(message.constructor == XMLHttpRequest){
    try{
      json = JSON.parse(message.responseText);
    }catch(e){
      json = {
        error:{
          message: message.responseText
        }
      }
    }
  }else if(typeof message == "string"){
    json = {
      error:{
        message:message
      }
    };
  }

  var text = json.error && json.error.message;

  var pop = $("<div>" + text + "</div>");
  pop.css({
    position:"fixed",
    opacity:"0",
    transition:"opacity linear .4s",
    top: "140px",
    left: "50%",
    zIndex: "30",
    padding: "10px 25px",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius:"5px"
  });
  pop.appendTo($("body"));
  var width = pop.width()
    // + ["padding-left","padding-right","border-left","border-right"].map(function(prop){
    //   return parseInt(pop.css(prop));
    // }).reduce(function(a,b){
    //   return a+b;
    // },0);
  pop.css({
    "margin-left": - width / 2
  });
  setTimeout(function(){
    pop.css({
      "opacity":1
    });
  });
  setTimeout(function(){
    pop.css({
      "opacity":0
    });
    setTimeout(function(){
      pop.remove();
    },400);
  },1500)
}

module.exports = popMessage
}, {
    entries:entries,
    map:globalMap
});
})();