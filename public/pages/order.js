var $ = require("zepto");
var popMessage = require('./mod/popmessage')
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
      $("#order").css("position","fixed");
      if(!finishPanel){
        finishPanel = finishorder;
        finishPanel.on("confirm",function(data){
          posting = true;
          $("#order").css("position","static");
          $.post("/api/v1/orders/" + order._id + "/done",data,"json").done(function(){
            location.href = "/orders";
          }).fail(popMessage);
        }).on("cancel",function(){
          $("#order").css("position","static");
        });
      }
      finishPanel.show();
    });
  }
});

require.async("./finishorder.js",function(finishorder){});