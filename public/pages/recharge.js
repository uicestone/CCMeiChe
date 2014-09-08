var $ = require("zepto");
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
    alert("请选择充值金额");
    return;
  }

  $.post("/api/v1/recharge/" + price).done(function(result){
    var paymentargs = result.paymentargs;
    var orderId = result.orderId;
    $.post("/wechat/notify",{
      orderId: orderId,
      type: 'recharge'
    },'json').done(function(){
      location.href = "/";
    });
    // WeixinJSBridge.invoke('getBrandWCPayRequest',paymentargs,function(res){
    //   var message = res.err_msg;
    //   if(message == "get_brand_wcpay_request:ok"){
    //     alert("支付成功！");
    //     location.href = "/";
    //   }else{
    //     popMessage("支付失败，请重试");
    //     self.emit("cancel",order,message);
    //   }
    // });
  }).fail(function(){
    console.log("fail");
  });

});