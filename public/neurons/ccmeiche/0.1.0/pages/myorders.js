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
var _9 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _10 = "zepto@^1.1.3";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_5, [_9], function(require, exports, module, __filename, __dirname) {
require("./mod/countdown");
}, {
    entries:entries,
    map:mix({"./mod/countdown":_9},globalMap)
});

define(_9, [_10], function(require, exports, module, __filename, __dirname) {
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