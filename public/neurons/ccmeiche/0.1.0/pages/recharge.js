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
var _11 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_9, [_10,_11], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var popMessage = require("./mod/popmessage");
var current = null;
$(".choices .row").on("tap",function(){
  if(current){
    current.removeClass("active");
  }
  var el = $(this);
  el.addClass("active");
  current = el;
});

$(".button").on("tap",function(){

  var id = $(".row.active").attr("data-id");

  if(!id){
    popMessage("请选择");
    return;
  }

  function popSuccess(){
    if($("h1").text() == "充值"){
      popMessage("您已成功充值" + $(".active .price").text().slice(1) + "元",{textAlign:"center"},true);
    }else{
      popMessage("您已成功购买" + $(".active .title").text(),{textAlign:"center"},true);
    }
    setTimeout(function(){
      location.href = "/wechat/?showwxpaytitle=1";
    },1000);
  }

  $.post("/api/v1/recharge/" + id).done(function(result){
    var payment_args = result.payment_args;
    var orderId = result.orderId;
    if(appConfig.env !== "product"){
      $.post("/wechat/notify",{
        orderId: orderId,
        type: 'recharge'
      },'json').done(function(){
        popSuccess();
      });
    }else{
      WeixinJSBridge.invoke('getBrandWCPayRequest',payment_args,function(res){
        var message = res.err_msg;
        if(message == "get_brand_wcpay_request:ok"){
          popSuccess();
        }else{
          popMessage("支付失败，请重试");
        }
      });
    }
  }).fail(function(){
    console.log("fail");
  });

});
}, {
    entries:entries,
    map:mix({"./mod/popmessage":_11},globalMap)
});

define(_11, [_10], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
function popMessage(message, styles, notDismiss){
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
    borderRadius:"5px",
    width: "200px"
  }).addClass("popmessage");
  pop.css(styles || {});
  pop.appendTo($("body"));
  var width = pop.width();
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
  if(!notDismiss){
  setTimeout(function(){
    pop.css({
      "opacity":0
    });
    setTimeout(function(){
      pop.remove();
    },400);
  },2000);
  }
}

module.exports = popMessage
}, {
    entries:entries,
    map:globalMap
});
})();