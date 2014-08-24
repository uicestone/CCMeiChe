(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/myinfos.js";
var _5 = "ccmeiche@0.1.0/pages/myorders.js";
var _6 = "ccmeiche@0.1.0/pages/order.js";
var _7 = "ccmeiche@0.1.0/pages/preorder.js";
var _8 = "ccmeiche@0.1.0/pages/recharge.js";
var _9 = "zepto@^1.1.3";
var _10 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_6, [_9,_10], function(require, exports, module, __filename, __dirname) {
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

}, {
    entries:entries,
    map:mix({"./mod/countdown":_10},globalMap)
});

define(_10, [_9], function(require, exports, module, __filename, __dirname) {
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