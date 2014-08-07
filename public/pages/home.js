var $ = require("zepto");
var tpl = require("tpl");


var chinese_numbers = "一二三四五六七八九十".split("");
var carsList = $(".cars ul");
$(".cars .add").on("click", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    // addcar.show();
    addcar.on("add",function(data){
      var template = "<li><div class='index'>车型@{it.index}</div>"
        +"<div class='detail'>"
          +"<div class='type'>@{it.type}@{it.color}</div>"
          +"<div class='number'>@{it.number}</div>"
        +"</div></li>";
      data.index = chinese_numbers[ carsList.find("li").length ];
      var html = tpl.render(template,data);
      var li = $(html);
      li.on("touchend", function(){
        $(this).toggleClass("active");
      });
      li.data("car", data);
      console.log(li);
      carsList.append(li);
      addbtn.prop("disable",false);
    });
    addcar.emit("add",{
      type:"奥迪A8",
      number:"沪A91223",
      color:"白色"
    });
  });
});

$(".cars .add").trigger("click");

(function(){
  var current = null;
  var services_items = $(".services li");
  services_items.on("touchend",function(){
    var me = $(this);
    if(me == current){
      me.removeClass("active");
      current = null;
    }else{
      current && current.removeClass("active");
      me.addClass("active");
      current = me;
    }
  });
})();


navigator.geolocation.getCurrentPosition(function(position){
  $("#latlng").val([position.coords.latitude,position.coords.longitude].join(","));
},function(){});

$("#go-wash").on("touchend", function(){
  var data = {
    carpark:$(".carpark input").val(),
    address:$(".address input").val(),
    latlng :$("#latlng").val(),
    service:"",
    promo:"",
    cars:[]
  };

  if(!data.carpark){
    alert("请填写具体车位");
    return;
  }

  if(!data.address){
    alert("请填写地址");
    return;
  }

  // if(!data.service){
  //   alert("请选择服务");
  // }

  // if(!data.cars.length){
  //   alert("请添加车辆");
  // }

  $.post("/api/v1/preorder",data).done(function(result){
    console.log(result);
  }).fail(function(){
    alert("fail");
  })

});

