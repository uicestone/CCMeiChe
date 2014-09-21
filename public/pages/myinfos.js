var $ = require("zepto");
var tpl = require("tpl");

var panelAddCar = require("./views/addcar");
var autocomplete = require("./mod/autocomplete");
var carsList = $(".cars ul");
var popMessage = require("./mod/popmessage");

panelAddCar.on("submit",function(data){
  var template = "<div class='text'>"
      +"<p class='title'>@{it.type} @{it.color}</p>"
      +"<p class='desc'>@{it.number}</p>"
    +"</div>"
    +"<div class='edit'>修改</div>";
  var html = tpl.render(template,data);
  var li;
  if("index" in data){
    li = $(".cars li:eq(" + data.index + ")");
    delete data.index;
    li.attr('data',JSON.stringify(data)).html(html);
  }else{
    li = $("<li class='row'/>").attr('data',JSON.stringify(data)).html(html);
    carsList.append(li);
  }
});

var addbtn = $(".addcar");
// 添加车辆
addbtn.on("tap", function(){
  if(addbtn.prop("disabled")){
    return;
  }
  panelAddCar.show();
});

$(".cars").on("tap", ".edit", function(){
  var data = $(this).parent().attr('data');
  data = JSON.parse(data);
  data.index = $(".cars .edit").index(this);
  panelAddCar.show(data);
});

var addaddress = $(".addaddress");
var addressesList = $(".addresses ul");
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

addaddress.on("tap",function(){
  addaddressPanel.show()
});

$("#save-address").on("tap",function(){
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
    var template = "<div class='text'>"
      +"<p class='title'>@{it.address}</p>"
      +"<p class='desc'>@{it.carpark}</p>"
    +"</div>"
    +"<div class='edit'>修改</div>";

    var html = tpl.render(template,data);
    li = $("<li class='row'/>").attr('data',JSON.stringify(data)).html(html);
    addressesList.append(li);
    $("#input-latlng").val('');
    $("#input-address").val('');
    $("#input-carpark").val('');
    addaddressPanel.hide();
  })
  .fail(popMessage);
});