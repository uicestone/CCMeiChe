require("./mod/countdown");
var $ = require("zepto");
var popMessage = require("./mod/popmessage");
$("li").each(function(i,el){
  var $el = $(el);
  var id = $el.attr("data-id");
  var clickable = true;
  $el.find(".cancel").on("click",function(){
    if(!clickable){return;}
    clickable = false;
    $.post("/api/v1/myorders/cancel",{
      orderId: id,
      reason: "order_cancel"
    },'json').done(function(){
      location.reload();
    }).fail(function(xhr){
      popMessage(xhr);
      clickable = true;
      setTimeout(function(){
        location.reload();
      },1000)
    });
  });
});
