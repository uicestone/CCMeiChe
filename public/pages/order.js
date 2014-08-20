var $ = require("zepto");

require("./mod/countdown");

var button = $(".button");
var posting = false;
button.on("touchend",function(e){
  if(posting){return;}
  if(button.hasClass("arrive")){
    posting = true;
    $.post("/api/v1/orders/" + order._id + "/arrive").done(function(){
      posting = false;
      button.html("完成");
      button.removeClass("arrive").addClass("done");
    });
  }else if(button.hasClass("done")){
    posting = true;
    $.post("/api/v1/orders/" + order._id + "/done").done(function(){
      location.href = "/orders";
    });
  }
});
