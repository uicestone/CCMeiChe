var $ = require("zepto");
var tpl = require("tpl");

var panelAddCar;
var carsList = $(".cars ul");
// 添加车辆
$(".cars .add").on("touchend", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    if(!panelAddCar){
      panelAddCar = addcar;
      panelAddCar.on("add",function(data){
        var template = "<li class='row'><div class='label'>车型</div>"
          +"<div class='text cartype'>"
            +"<p class='type'>@{it.type}</p>"
            +"<p class='number'>@{it.number}</p>"
          +"</div></li>";
        var html = tpl.render(template,data);
        var li = $(html);
        li.on("touchend", function(){
          $(this).toggleClass("active");
        });
        li.data("car", data);
        carsList.append(li);
        addbtn.prop("disable",false);
      });
    }
    panelAddCar.show();
  });
});
