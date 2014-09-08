require("./mod/countdown");
var $ = require("zepto");
$("li").each(function(i,el){
  var $el = $(el);
  var id = $el.attr("data-id");
  $el.find(".cancel").on("click",function(){
    $.post("/api/v1/myorders/cancel",{
      orderId: id
    },'json').done(function(){
      location.reload();
    });
  });
});
