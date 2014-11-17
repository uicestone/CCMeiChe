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

  $.post("/api/v1/recharge/" + id).done(function(result){
    var payment_args = result.payment_args;
    var orderId = result.orderId;
    if(appConfig.env !== "product"){
      $.post("/wechat/notify",{
        orderId: orderId,
        type: 'recharge'
      },'json').done(function(){
        if($("h1").text() == "充值"){
          popMessage("充值成功",{textAlign:"center"});
        }else{
          popMessage("购买成功",{textAlign:"center"});
        }
        setTimeout(function(){
          location.href = "/wechat/?showwxpaytitle=1";
        },1000);
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