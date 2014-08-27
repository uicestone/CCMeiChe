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
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_12, [_19,_5], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

require("./mod/countdown");

var button = $(".button");
var posting = false;
var finishPanel = null;
button.on("touchend",function(e){
  if(posting){return;}
  if(button.hasClass("arrive")){
    posting = true;
    $.post("/api/v1/orders/" + order._id + "/arrive").done(function(){
      posting = false;
      button.html("完成");
      button.removeClass("arrive").addClass("done");
    });
  }else if(button.hasClass("done")){

    require.async("./finishorder.js",function(finishorder){
      $("#order").css("position","fixed");
      if(!finishPanel){
        finishPanel = finishorder;
        finishPanel.on("done",function(data){
          posting = true;
          $.post("/api/v1/orders/" + order._id + "/done",data).done(function(){
            location.href = "/orders";
          });
        });
      }
      finishPanel.show();
    });
  }
});


    require.async("./finishorder.js",function(finishorder){
      $("#order").css("position","fixed");
      if(!finishPanel){
        finishPanel = finishorder;
        finishPanel.on("done",function(data){
          posting = true;
          $.post("/api/v1/orders/" + order._id + "/done",data).done(function(){
            location.href = "/orders";
          });
        });
      }
      finishPanel.show();
    });
}, {
    entries:entries,
    map:mix({"./mod/countdown":_5},globalMap)
});

define(_5, [_19], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function addZero(num){
  if(Math.abs(num) < 10){
    return "0" + num;
  }else{
    return num;
  }
}

function calculateTime(){
  $(".time").forEach(function(elem,i){
    var el = $(elem);
    var finish_time = new Date(el.attr("data-finish"));
    var now = new Date();
    var duration = finish_time - now;
    var negative = now > finish_time ? "-" : "";
    var minutes =  Math.floor( Math.abs( duration / (1000 * 60)));
    var seconds = Math.round( (Math.abs(duration) - minutes * 1000 * 60) / 1000);
    el.html( negative + addZero(minutes) + ":" + addZero(seconds) );
  });
}


setInterval(calculateTime,1000);
calculateTime();
}, {
    entries:entries,
    map:globalMap
});
})();