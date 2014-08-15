var $ = require("zepto");
var tpl = require("tpl");
var autocomplete = require('./mod/autocomplete');

var chinese_numbers = "一二三四五六七八九十".split("");
var carsList = $(".cars ul");

// 选择车辆
$(".cars li").on("touchend", function(){
  $(this).toggleClass("active");
  calculate();
});

var panelAddCar,panelPreOrder;

// 添加车辆
$(".cars .add").on("touchend", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    if(!panelAddCar){
      panelAddCar = addcar;
      panelAddCar.on("add",function(data){
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
        carsList.append(li);
        addbtn.prop("disable",false);
      });
    }
    panelAddCar.show();

  });
});

// 选择服务
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
    calculate();
  });
})();
$(".services li:eq(0)").trigger("touchend");

// 使用积分
$(".credit .use").on("touchend",function(){
  $(this).toggleClass("active");
  calculate();
});

// 计算应付金额
function calculate(){
  var cars_count = $(".cars .active").length;
  var service = JSON.parse($(".services .active").attr("data"));
  var use_credit = $(".credit .use").hasClass("active");
  var count = 0;
  var promo = user.promo;
  var credit = user.credit;

  for(var i = 0; i < cars_count; i++){
    if(service.promo && service.promo != 0 && promo - service.promo >= 0){
      promo -= service.promo;
    }else{
      count += (+service.price);
    }
  }

  if(use_credit){
    count -= credit;
  }

  if(count < 0){
    count = 0;
  }

  $(".payment .count").html(count);
}

// 地址及经纬度
navigator.geolocation.getCurrentPosition(function(position){
  var latlng = [position.coords.latitude,position.coords.longitude].join(",");
  $("#latlng").val(latlng);
  $.get("/api/v1/location/latlng/" + latlng, function(data){
    $(".location .input").val(data.result.formatted_address);
  });
},function(){});

// 地址提示
var updatingLatlng = false;
(function(){
function updateLatlng(){
  ac.hide();
  clearTimeout(updateLatlng.timeout);
  updateLatlng.timeout = setTimeout(function(){
    updatingLatlng = true;
    var val = $(".location .input").val().replace(/[\(\)\/]/g,'');
    $.get("/api/v1/location/address/" + val, function(data){
      updatingLatlng = false;
      if(data.status == 0){
        $("#latlng").val( data.result.location.lat + "," + data.result.location.lng )
      }else{
        alert("无法解析该地址确切位置");
        $("#latlng").val("");
      }
    });
  },200);
}

// 地址提示
function placeSuggestionParser(data){
  if(data.status == 0){
    return data.result.map(function(item){
      return item.name
    });
  }else{
    return [];
  }
}

var ac = autocomplete.init($(".location .input"),placeSuggestionParser).on("select",updateLatlng);

$(".location .input").on("click",function(){
  $(this)[0].focus();
  $(this)[0].select();
}).on("blur",updateLatlng);

})();

$("#go-wash").on("touchend", function(){
  if(updatingLatlng){
    alert("正在获取确切位置");
    return;
  }

  var data = {
    carpark:$(".carpark input").val(),
    address:$("#address").val(),
    latlng :$("#latlng").val(),
    service:JSON.parse($(".services .active").attr("data")),
    use_credit: $(".credit .use").hasClass("active"),
    price: $(".payment .count").html(),
    cars:$(".cars .active").get().map(function(e,i){return JSON.parse($(e).attr("data"))})
  };

  if(!data.cars.length){
    alert("请添加车辆");
    return;
  }

  if(!data.address){
    alert("请填写地址");
    return;
  }

  if(!data.carpark){
    alert("请填写具体车位");
    return;
  }

  function addZero(num){
    return num < 10 ? ("0" + num) : num;
  }

  $.post("/api/v1/preorder",data).done(function(result){
    require.async("./preorder.js",function(preorder){
      if(!panelPreOrder){
        panelPreOrder = preorder;
        panelPreOrder.on("confirm",function(){
          data.worker_id = result.worker_id;
          $.post("/api/v1/myorders",data).done(function(){
            console.log(arguments);
          });
        });
      }
      var finish_time = new Date(+new Date() + result.time * 60 * 1000);
      panelPreOrder.show({
        service: data.service,
        phone: user.phone,
        cars: data.cars,
        address: data.address,
        price: data.price,
        worker_id: result.worker_id,
        time: addZero(finish_time.getHours()) + ":" + addZero(finish_time.getMinutes())
      });
    });
  }).fail(function(){
    alert("fail");
  })

});

