var $ = require("zepto");
var tpl = require("tpl");

var panelAddCar = require("./views/addcar");
var autocomplete = require("./mod/autocomplete");
var carsList = $(".cars ul");
var popMessage = require("./mod/popmessage");

panelAddCar.on("submit",function(data){
  var template = "<li class='row'><div class='label'>车型</div>"
    +"<div class='text cartype'>"
      +"<p class='type'>@{it.type}</p>"
      +"<p class='number'>@{it.number}</p>"
    +"</div></li>";
  var html = tpl.render(template,data);
  var li = $(html);
  li.on("click", function(){
    $(this).toggleClass("active");
  });
  li.data("car", data);
  carsList.append(li);
});

var addbtn = $(".addcar");
// 添加车辆
addbtn.on("click", function(){
  if(addbtn.prop("disabled")){
    return;
  }
  panelAddCar.show();
});

var addaddress = $(".addaddress");
var addaddressPanel = $(".addaddress-panel");
var ac = autocomplete.init($("#input-address"),function(item){
  return item.name + (item.address ? ("<span class='small'>" + item.address + "</span>") : "");
},function(item){
  return item.name
}).on("select",function(data){
  if(!data || !data.location){
    return;
  }
  $("#input-latlng").val(data.location.lat + "," + data.location.lng);
});

addaddress.on("click",function(){
  addaddressPanel.show()
});

$("#save-address").on("click",function(){
  var data = {
    latlng: $("#input-latlng").val(),
    address: $("#input-address").val(),
    carpark: $("#input-carpark").val()
  };

  if(!data.address){
    return popMessage("请输入地址");
  }

  if(!data.carpark){
    return popMessage("请输入车位");
  }

  if(!data.latlng){
    return popMessage("无法定位该地址");
  }

  $.post("/api/v1/myaddresses",data,"json")
  .done(function(){
  })
  .fail(popMessage);
  addaddressPanel.hide();
});