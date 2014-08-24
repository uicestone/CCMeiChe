var $ = require("zepto");

require("./mod/countdown");

var button = $(".button");
var posting = false;
var finishPanel = null;
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

    require.async("./finishorder.js",function(finishorder){
      if(!finishPanel){
        finishPanel = finishorder;
        finishPanel.on("done",function(data){
          posting = true;
          $.post("/api/v1/orders/" + order._id + "/done",data).done(function(){
            location.href = "/orders";
          });
        });
      }
      finishPanel.show();
    });
  }
});
