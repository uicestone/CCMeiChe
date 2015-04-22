(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/month_package.js";
var _4 = "ccmeiche@0.1.0/pages/myinfos.js";
var _5 = "ccmeiche@0.1.0/pages/myorders.js";
var _6 = "ccmeiche@0.1.0/pages/order-result.js";
var _7 = "ccmeiche@0.1.0/pages/order.js";
var _8 = "ccmeiche@0.1.0/pages/promos.js";
var _9 = "ccmeiche@0.1.0/pages/recharge.js";
var _10 = "zepto@^1.1.3";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_2, [_10], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
// 菜单展开收起
(function(){
  $(".menu").on("tap",function(){
    $("body").css("position","fixed");
    $("body").addClass("openmenu");
  });
  $('.overlay').on("tap",function(){
    $("body").css("position","static");
    $("body").removeClass("openmenu");
  });
})();
}, {
    entries:entries,
    map:globalMap
});
})();