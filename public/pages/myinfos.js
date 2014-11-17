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
    li.attr('data-addr',JSON.stringify(data)).html(html);
  }else{
    li = $("<li class='row'/>").attr('data-addr',JSON.stringify(data)).html(html);
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
  addaddressPanel.appendTo(".section.addresses");
  addaddressPanel.addClass("action-add").removeClass("action-edit");
  addaddress.hide();
  addaddressPanel.show();
  addressesList.find("li .wrap").show();
  addaddressPanel.find(".title").html("添加地址信息");
});

addressesList.on("tap",".edit",function(){
  var li = $(this).closest('li');
  var wrap = li.find(".wrap");
  var wraps = addressesList.find("li .wrap");
  var index = wraps.index(wrap);
  var data = JSON.parse(li.attr("data-addr"));
  wraps.show();
  wrap.hide();
  addaddress.show();
  console.log(index);
  $("#input-index").val(index);
  $("#input-latlng").val(data.latlng && data.latlng.join(","));
  $("#input-address").val(data.address);
  $("#input-carpark").val(data.carpark);
  addaddressPanel.addClass("action-edit").removeClass("action-add");
  addaddressPanel.appendTo(li);
  addaddressPanel.find(".title").html("修改地址信息");
  addaddressPanel.show();
});

$("#remove-address").on("tap", function(){
  var row = $(this).closest("li");
  var index = $("#input-index").val();  

  addaddressPanel.appendTo(".section.addresses");
  row.remove();

  addaddressPanel.hide();

  $.ajax({
    url: "/api/v1/myaddresses/" + index,
    type: "DELETE",
    success: function(){
      console.log(arguments);
    }
  });

});

$("#save-address").on("tap",function(){
  var index = $("#input-index").val();
  var data = {
    latlng: $("#input-latlng").val().split(","),
    address: $("#input-address").val(),
    carpark: $("#input-carpark").val()
  };
  var type = "add";

  if(index!==""){
    type = "edit";
  }

  if(!data.address){
    return popMessage("请输入地址");
  }

  if(!data.carpark){
    return popMessage("请输入车位");
  }

  if(!data.latlng){
    return popMessage("无法定位该地址");
  }

  var url = (type == "edit") ? ("/api/v1/myaddresses/" + index) : "/api/v1/myaddresses";

  $.post(url, data, "json")
  .done(function(){

    if(type == "add"){
      var template = "<div class='wrap'><div class='text'>"
        +"<p class='title'>@{it.address}</p>"
        +"<p class='desc'>@{it.carpark}</p>"
      +"</div>"
      +"<div class='edit'>修改</div></div>";
      var html = tpl.render(template,data);
      li = $("<li class='row'/>").attr('data-addr',JSON.stringify(data)).html(html);
      addressesList.append(li);
    }else{
      var li = $(".addresses .row").eq(index);
      li.attr("data-addr", JSON.stringify(data));
      li.find(".title").text(data.address);
      li.find(".desc").text(data.carpark);
    }

    $(".addresses .wrap").show();
    $("#input-latlng").val('');
    $("#input-address").val('');
    $("#input-carpark").val('');
    addaddressPanel.hide();
    addaddress.show();
  })
  .fail(popMessage);
});