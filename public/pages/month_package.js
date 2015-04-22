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
    popMessage("您已成功购买" + $(".active .title").text().trim() ,true);
    setTimeout(function(){
      location.href = "/wechat/?showwxpaytitle=1";
    },1000);
  }

  $.post("/api/v1/pay_month_package/" + id).done(function(result){
    var payment_args = result.payment_args;
    var orderId = result.orderId;
    if(appConfig.env !== "product"){
      $.post("/wechat/notify",{
        orderId: orderId,
        type: 'monthpackage'
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