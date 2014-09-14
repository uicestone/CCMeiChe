var $ = require("zepto");
var tpl = require("tpl");
var autocomplete = require('./mod/autocomplete');
var singleSelect = require('./mod/singleselect');
var popselect = require('./mod/popselect');
var popMessage = require('./mod/popmessage');
var hashState = require('hashstate')();
var panelAddCar = require("./views/addcar");
var panelPreOrder = require("./views/preorder");
// 菜单展开收起
(function(){
  $(".menu").on("touchend",function(){
    $("body").css("position","fixed");
    $("body").addClass("openmenu");
  });
  $('.overlay').on("touchend",function(){
    $("body").css("position","static");
    $("body").removeClass("openmenu");
  });
})();

hashState.setHash("");

var carsSelect = popselect(user.cars,{
  type:"multi",
  parser: function(car){
    return car.type + car.color + "<br />" + car.number;
  }
});
carsSelect.on("submit",function(dataList){
  $("body").css("position","static");
  var ul = $(".selected-cars ul");
  ul.empty();
  dataList.forEach(function(data){
    var li = $('<li data=\''
        + JSON.stringify(data)
      + '\'><div class="detail"><div class="type">'
      + data.type + data.color
      + '</div>'
      +'<div class="number">' + data.number + '</div></div></li>');
    ul.append(li);
  });
  calculate();
});
carsSelect.on("open",function(){
  $("body").css("position","fixed");
  var data = $(".selected-cars li").get().map(function(el,i){
    var data = JSON.parse($(el).attr("data"));
    return data;
  });

  carsSelect.select(data);
});
carsSelect.on("close",function(){
  $("body").css("position","static");
});
// 选择车辆
$(".cars .selected-cars").on("touchend", function(){
  carsSelect.open();
});


var carsList = $(".cars ul");
var addbtn = $(".cars .add");
// 添加车辆
panelAddCar.on("cancel",function(){
  $("body").css("position","static");
});
panelAddCar.on("submit",function(data){
  $("body").css("position","static");
  carsSelect.add(data);
  var template = "<li data='" + JSON.stringify(data) + "'>"
    +"<div class='detail'>"
      +"<div class='type'>@{it.type}@{it.color}</div>"
      +"<div class='number'>@{it.number}</div>"
    +"</div></li>";
  var html = tpl.render(template,data);
  var li = $(html);
  carsList.append(li);
  if($(".cars-cell li").length >= 5){
    addbtn.remove();
  }
  calculate();
});
addbtn.on("touchend", function(e){
  e.preventDefault();
  $("body").css("position","fixed");
  panelAddCar.show();
  setTimeout(function(){
    $(".blank").hide();
  },400);
});

// 选择服务
var currentService = window.services[0];
(function(){
  var serviceSelect = popselect(services, {
    type: 'single',
    name:"service-select",
    parser: function(service){
      return '<div>'
        + '<div class="detail">'
          + '<div class="title">' + service.title + '</div>'
          + '<div class="desc">' + service.describe + '</div>'
        + '</div>'
        + '<div>'
          + '<div class="price">￥' + service.price + '</div>'
        + '</div>';
    }
  });
  serviceSelect.on("open",function(){
    $("body").css("position","fixed");
    serviceSelect.select(currentService);
  }).on("submit",function(result){
    $("body").css("position","static");
    currentService = result[0];
    var li = $(".services li");currentService
    li.find(".title").html(currentService.title);
    li.find(".desc").html(currentService.describe);
    li.find(".price").html("￥" + currentService.price);
    judgePromo();
    calculate();
  }).on("close",function(){
    $("body").css("position","static");
  });

  $(".services").on('touchend',function(){
    serviceSelect.open();
  });
})();

// 优惠券
function judgePromo(){
  var mypromo = user.promo.filter(function(item){
    return item._id == currentService._id;
  })[0];
  if(mypromo && mypromo.amount){
    $(".promo").show();
    var html = "";
    $(".promo .text").html(1);
    for(var i = 0; i < mypromo.amount + 1; i++){
      if(i==1){
        html += ("<option selected>" + i + "</option>");
      }else{
        html += ("<option>" + i + "</option>");
      }
    }

    $(".promo select").html(html);
  }else{
    $(".promo").hide();
  }
}
judgePromo();
$(".section.promo select").on("change",function(){
  $(".section.promo .text").text($(this).val());
  calculate();
});

// 使用积分
$(".credit .use").on("touchend",function(){
  var el = $(this);
  var text = el.find(".text");
  if(el.hasClass("active")){
    el.removeClass("active");
    text.html("未使用");
  }else{
    el.addClass('active');
    text.html("已使用");
  }
  calculate();
});

function getPromoCount(){
  var promo_count = 0;
  if($(".section.promo").is(":visible")){
    promo_count = +$(".section.promo .text").text();
  }
  return promo_count;
}

// 计算应付金额
function calculate(){
  var cars_count = $(".cars-cell li").length;
  var service = currentService;
  var use_credit = $(".credit .use").hasClass("active");
  var count = 0;
  var promo_count = getPromoCount();

  var credit = user.credit;

  for(var i = 0; i < cars_count; i++){
    if(promo_count){
      promo_count--;
    }else{
      count += (+service.price);
    }
  }

  if(use_credit){
    if(credit < count){
      count = count - credit;
      credit = 0;
    }else{
      credit = credit - count;
      count = 0;
    }
  }

  $(".credit .num").html(credit);
  $(".payment .count").html(count);
}
calculate();

// 地址及经纬度
navigator.geolocation.getCurrentPosition(function(position){
  var latlng = [position.coords.latitude,position.coords.longitude].join(",");
  $("#latlng").val(latlng);
  $.get("/api/v1/location/latlng/" + latlng, function(data){
    $(".location .input").val(data.result.formatted_address);
  });
},function(){
  if($(".location .input").val()){return;}
  popMessage("无法定位当前位置");
});

// 地址提示
(function(){
function updateLatlng(data){
  if(!data || !data.location){
    return;
  }
  $("#latlng").val(data.location.lat + "," + data.location.lng);
}

var addressInput = $("#address");
var latlngInput = $("#latlng");
var carparkInput = $("#carpark");
var ac = autocomplete.init(addressInput,function(item){
  return item.name + (item.address ? ("<span class='small'>" + item.address + "</span>") : "");
},function(item){
  return item.name
}).on("select",updateLatlng);
var defaultLocationList = initDefaultLocationList();

function initDefaultLocationList(){

  var list = $("<ul class='autocomplete' />");
  list.appendTo($(".location"));

  user.addresses.forEach(function(item){
    var li = $("<li />");
    li.html(item.address + "<span class='small'>" + item.carpark + "</span>");
    li.appendTo(list);
    li.on("click", function(){
      addressInput.val(item.address);
      latlngInput.val(item.latlng);
      carparkInput.val(item.carpark);
      list.hide();
      ac.stopWatch();
    });
  });

  var packup = $("<li class='packup'>收起</li>");
  packup.on("click",function(){
    list.hide();
  });
  packup.appendTo(list);

  list.hide();
  return list
}
function popDefault(){
  var el = $(this);
  if(!el.val().trim() && user.addresses && user.addresses.length){
    $(".location .autocomplete").hide();
    defaultLocationList.show();
  }else{
    $(".location .autocomplete").show();
    defaultLocationList.hide();
  }
}
addressInput.on('focus',popDefault);
addressInput.on('keyup',popDefault);
addressInput.on("click",function(){
  $(this)[0].focus();
  $(this)[0].select();
});

})();

$("#go-wash").on("touchend", function(e){
  var el = $(this);
  if(el.prop("disabled")){
    e.preventDefault();
    return;
  }
  var data = {
    carpark:$(".carpark input").val(),
    address:$("#address").val(),
    latlng :$("#latlng").val(),
    service:currentService,
    promo_count: getPromoCount(),
    use_credit: $(".credit .use").hasClass("active"),
    price: +$(".payment .count").html(),
    cars:$(".cars li").get().map(function(e,i){return JSON.parse($(e).attr("data"))})
  };

  if(!data.cars.length){
    alert("请添加车辆");
    return;
  }

  if(!data.address){
    alert("请填写地址");
    return;
  }

  if(!data.latlng){
    alert("请选择确切位置");
    return;
  }

  if(!data.carpark){
    alert("请填写具体车位");
    return;
  }

  el.prop("disabled",true);
  $.post("/api/v1/preorder",data,"json").done(function(order){
    panelPreOrder.show(order);
  }).fail(function(xhr){
    popMessage(xhr);
    el.prop("disabled",false);
  });

});

if(!user.cars.length){
  $(".cars .add").trigger("touchend");
}else{
  $(".blank").hide();
  $("body").css("position","static");
}
// require.async("./addcar.js",function(){});
// require.async("./preorder.js",function(){});
