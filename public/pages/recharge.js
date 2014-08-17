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

  $.post("/api/v1/recharge/" + price).done(function(){
    location.href = "/";
  }).fail(function(){
  });

});