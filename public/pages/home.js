var $ = require("zepto");
var tpl = require("tpl");
var autocomplete = require('./mod/autocomplete');
var singleSelect = require('./mod/singleselect');
var popselect = require('./mod/popselect');
var popMessage = require('./mod/popmessage');
var hashState = require('hashstate')();
var panelAddCar = require("./views/addcar");
var panelPreOrder = require("./views/preorder");
var inputClear = require("./mod/input-clear");

hashState.setHash("");

var carsSelect = popselect(user.cars,{
  type:"multi",
  parser: function(car){
    return "<div class='title'>" + car.type + car.color + "</div>"
      +"<div class='desc'>" + car.number + "</div>";
  }
});
carsSelect.validate = function(dataList){
  if(!dataList.length){
    popMessage("请选择车辆");
    return false;
  }
  return true;
}
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
$(".cars .selected-cars").on("tap", function(){
  carsSelect.open();
});


var carsList = $(".cars ul");
var addbtn = $(".cars .add");
// 添加车辆
panelAddCar.on("submit",function(data){
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
addbtn.on("click", function(e){
  e.preventDefault();
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
      var haspromo = user.promo.some(function(promo){
        return promo._id == service._id;
      });
      return '<div>'
        + '<div class="detail">'
          + '<div class="title">' + service.title + '</div>'
          + '<div class="desc">' + service.describe + '</div>'
        + '</div>'
        + '<div>'
          + '<div class="price">￥' + service.price + '</div>'
          + ( haspromo ? '<div class="haspromo">有优惠券</div>' : '')
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

  $(".services").on('tap',function(){
    serviceSelect.open();
  });
})();

// 优惠券
function judgePromo(){
  var mypromo = user.promo.filter(function(item){
    return item._id == currentService._id;
  })[0];
  var hascredit = user.credit && user.credit > 0;
  if(mypromo && mypromo.amount){
    $(".promo").removeClass("disabled");
    var html = "";
    var defaultSelected = hascredit ? 0 : 1;
    $(".promo .num .text").html(defaultSelected);
    for(var i = 0; i < mypromo.amount + 1; i++){
      if(i==defaultSelected){
        html += ("<option selected>" + i + "</option>");
      }else{
        html += ("<option>" + i + "</option>");
      }
    }

    $(".promo select").html(html);
    $(".promo>.text").html("已使用<br />优惠券");
  }else{
    $(".promo").addClass("disabled");
    $(".promo .num .text").text(0);
    $(".promo>.text").html("使用<br />优惠券");
  }
}
judgePromo();
$(".section .promo select").on("change",function(){
  $(".section .promo .num .text").text($(this).val());
  calculate();
});

// 使用积分
$(".section .credit .use").on("tap",function(){
  var parent = $(this).closest('.credit');
  if(parent.hasClass('disabled')){
    return false;
  }
  var el = $(this);
  var text = el.find(".text");
  if(el.hasClass("active")){
    el.removeClass("active");
    parent.data("active",false);
    text.html("未使用");
  }else{
    parent.data("active",true);
    el.addClass('active');
    text.html("已使用");
  }
  calculate();
});

function getPromoCount(){
  return +$(".section .promo .num .text").text();
}

// 计算应付金额
function calculate(){
  var cars_count = $(".cars-cell li").length;
  var promo_count = getPromoCount();
  var credit = user.credit;

  if(promo_count >= cars_count || !credit){
    $(".section .credit").addClass("disabled");
    $(".section .credit .use").removeClass("active");
  }else{
    $(".section .credit").removeClass("disabled");
    $(".section .credit .use").addClass( $(".section .credit").data("active") ? "active" : "");
  }
  var service = currentService;
  var use_credit = $(".section .credit .use").hasClass("active");
  var count = 0;




  for(var i = 0; i < cars_count; i++){
    if(promo_count){
      promo_count--;
    }else{
      count += (+service.price);
    }
  }

  if(use_credit){
    if(credit < count){
      count = ( parseInt(count * 100) - parseInt(credit * 100)) / 100;
      credit = 0;
    }else{
      credit = ( parseInt(credit * 100) - parseInt(count * 100)) / 100;
      count = 0;
    }
  }

  $(".section .credit .num").html(credit);
  $(".payment .count").html(count);
}
calculate();

// 地址及经纬度
navigator.geolocation.getCurrentPosition(function(position){
  var latlng = [position.coords.latitude,position.coords.longitude].join(",");
  $.get("/api/v1/location/latlng/" + latlng, function(data){
    var result = data.result;
    $("#latlng").val(result.location.lat + "," + result.location.lng);
    $(".location .input").val(result.pois[0].name);
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

// 清输入
inputClear($(".location"));
inputClear($(".carpark"));

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
    li.on("tap", function(){
      addressInput.val(item.address);
      latlngInput.val(item.latlng);
      carparkInput.val(item.carpark);
      list.hide();
      ac.stopWatch();
    });
  });

  var packup = $("<li class='packup'>收起</li>");
  packup.on("tap",function(){
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
addressInput.on("tap",function(){
  $(this)[0].focus();
  $(this)[0].select();
});

})();

$("#go-wash").on("tap", function(e){
  var el = $(this);
  if(el.prop("disabled")){
    e.preventDefault();
    return;
  }
  var order = {
    carpark:$(".carpark input").val(),
    address:$("#address").val(),
    latlng :$("#latlng").val(),
    service:currentService,
    promo_count: getPromoCount(),
    use_credit: $(".section .credit .use").hasClass("active"),
    price: +$(".payment .count").html(),
    cars:$(".cars li").get().map(function(e,i){return JSON.parse($(e).attr("data"))})
  };

  if(!order.cars.length){
    popMessage("请添加车辆");
    return;
  }

  if(!order.address){
    popMessage("请填写地址");
    return;
  }

  if(!order.latlng){
    popMessage("请选择确切位置");
    return;
  }

  if(!order.carpark){
    popMessage("请填写具体车位");
    return;
  }

  el.prop("disabled",true);
  popMessage("正在寻找车工...",{},true);
  $.ajax({
    type:"post",
    url:"/api/v1/estimate",
    data:{
      service_id: order.service._id,
      latlng: order.latlng
    },
    timeout: 15000,
    dataType:"json"
  }).done(function(result){
    panelPreOrder.show({
      phone: window.user.phone,
      address: order.address,
      carpark: order.carpark,
      cars: order.cars,
      price: order.price,
      service: order.service,
      finish_time: result.finish_time
    });
    panelPreOrder.order = order;
  }).fail(function(xhr, reason){
    $(".popmessage").remove();
    popMessage(reason == "timeout" ? "请求超时" : xhr);
    el.prop("disabled",false);
  });

});

if(!user.cars.length){
  $(".cars .add").trigger("click");
}else{
  $(".blank").hide();
  $("body").css("position","static");
}
