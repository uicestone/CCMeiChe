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