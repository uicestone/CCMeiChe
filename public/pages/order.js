var $ = require("zepto");
var popMessage = require('./mod/popmessage');
var finishPanel = require('./views/finishorder');
require("./mod/countdown");

var button = $(".button");
var posting = false;

finishPanel.on("confirm",function(data){
  posting = true;
  $("#order").css("position","static");
  $.post("/api/v1/orders/" + order._id + "/done",data,"json").done(function(){
    location.reload();
  }).fail(function(xhr){
    posting = false;
    popMessage(xhr);
  });
}).on("cancel",function(){
  $("#order").css("position","static");
});
button.on("click",function(e){
  if(posting){return;}
  if(button.hasClass("arrive")){
    posting = true;
    $.post("/api/v1/orders/" + order._id + "/arrive").done(function(){
      posting = false;
      button.html("完成");
      button.removeClass("arrive").addClass("done");
    });
  }else if(button.hasClass("done")){
    $("#order").css("position","fixed");
    finishPanel.show({
      cars: order.cars
    });
  }
});