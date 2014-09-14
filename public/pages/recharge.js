var $ = require("zepto");
var popMessage = require("./mod/popmessage");
var current = null;
$(".choices .row").on("touchend",function(){
  if(current){
    current.removeClass("active");
  }
  var el = $(this);
  el.addClass("active");
  current = el;
});

$(".button").on("touchend",function(){

  var price = $(".row.active").attr("data-price");

  if(!price){
    popMessage("请选择充值金额");
    return;
  }

  $.post("/api/v1/recharge/" + price).done(function(result){
    var payment_args = result.payment_args;
    var orderId = result.orderId;
    if(appConfig.env !== "product"){
      $.post("/wechat/notify",{
        orderId: orderId,
        type: 'recharge'
      },'json').done(function(){
        location.href = "/wechat/?showwxpaytitle=1";
      });
    }else{
      WeixinJSBridge.invoke('getBrandWCPayRequest',payment_args,function(res){
        var message = res.err_msg;
        if(message == "get_brand_wcpay_request:ok"){
          popMessage("支付成功！");
          location.href = "/wechat/?showwxpaytitle=1";
        }else{
          popMessage("支付失败，请重试");
        }
      });
    }
  }).fail(function(){
    console.log("fail");
  });

});