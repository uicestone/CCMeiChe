(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _3 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _4 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _5 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _6 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _9 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _10 = "ccmeiche@0.1.0/pages/myinfos.js";
var _11 = "ccmeiche@0.1.0/pages/myorders.js";
var _12 = "ccmeiche@0.1.0/pages/order.js";
var _13 = "ccmeiche@0.1.0/pages/recharge.js";
var _14 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _15 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _19 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _20 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _21 = "zepto@^1.1.3";
var _22 = "tpl@~0.2.1";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_10, [_21,_22], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var tpl = require("tpl");

var panelAddCar;
var carsList = $(".cars ul");
// 添加车辆
$(".cars .add").on("touchend", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    if(!panelAddCar){
      panelAddCar = addcar;
      panelAddCar.on("add",function(data){
        var template = "<li class='row'><div class='label'>车型</div>"
          +"<div class='text cartype'>"
            +"<p class='type'>@{it.type}</p>"
            +"<p class='number'>@{it.number}</p>"
          +"</div></li>";
        var html = tpl.render(template,data);
        var li = $(html);
        li.on("touchend", function(){
          $(this).toggleClass("active");
        });
        li.data("car", data);
        carsList.append(li);
        addbtn.prop("disable",false);
      });
    }
    panelAddCar.show();
  });
});

}, {
    entries:entries,
    map:globalMap
});
})();