(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _5 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _11 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _12 = "ccmeiche@0.1.0/pages/myinfos.js";
var _13 = "ccmeiche@0.1.0/pages/myorders.js";
var _14 = "ccmeiche@0.1.0/pages/order.js";
var _15 = "ccmeiche@0.1.0/pages/preorder.js";
var _16 = "ccmeiche@0.1.0/pages/recharge.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _21 = "zepto@^1.1.3";
var _22 = "tpl@~0.2.1";
var _23 = "hashstate@~0.1.0";
var _24 = "util@^1.0.4";
var _25 = "events@^1.0.5";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_2, [_21,_22,_23,_4,_9,_8,_7], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var tpl = require("tpl");
var autocomplete = require('./mod/autocomplete');
var singleSelect = require('./mod/singleselect');
var popselect = require('./mod/popselect');
var popMessage = require('./mod/popmessage');
var hashState = require('hashstate')();
// 菜单展开收起
(function(){
  $(".menu").on("touchend",function(){
    $("body").addClass("openmenu");
  });
  $('.overlay').on("touchend",function(){
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


var panelAddCar;
var carsList = $(".cars ul");
// 添加车辆
$(".cars .add").on("touchend", function(e){
  e.preventDefault();
  var addbtn = $(this);
  addbtn.prop("disabled",true);
  require.async("./addcar.js",function(addcar){
    $("body").css("position","fixed");
    if(!panelAddCar){
      panelAddCar = addcar;
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
        addbtn.prop("disabled",false);
        if($(".cars-cell li").length >= 5){
          addbtn.remove();
        }
        calculate();
      });
    }
    panelAddCar.show();
    setTimeout(function(){
      $(".blank").hide();
    },400);
  });
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
  if(mypromo && mypromo.count){
    $(".promo").show();
    var html = "";
    $(".promo .text").html(1);
    for(var i = 0; i < mypromo.count + 1; i++){
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
  ac.hide();
  if(!data || !data.location){
    return;
  }
  $("#latlng").val(data.location.lat + "," + data.location.lng);
}

var ac = autocomplete.init($(".location .input"),function(item){
  return item.name + (item.address ? ("<span class='small'>" + item.address + "</span>") : "");
},function(item){
  return item.name
}).on("select",updateLatlng);

$(".location .input").on("click",function(){
  $(this)[0].focus();
  $(this)[0].select();
}).on("blur",updateLatlng);

})();

var panelPreOrder;
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
    credit: user.credit - $(".credit .num").text().trim(),
    price: $(".payment .count").html(),
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
  $.post("/api/v1/preorder",data,"json").done(function(estimate){
    require.async("./preorder.js",function(preorder){
      if(!panelPreOrder){
        panelPreOrder = preorder;
        panelPreOrder.on("confirm",function(){
          el.prop("disabled",false);
          data.worker = estimate.worker;
          data.estimated_drive_time = estimate.drive_time;
          data.estimated_wash_time = estimate.wash_time;
          data.estimated_finish_time = estimate.finish_time;
          $.post("/api/v1/myorders",data).done(function(){
            location.href = "/myorders";
          });
        }).on("cancel",function(){
          el.prop("disabled",false);
        });
      }
      panelPreOrder.show({
        service: data.service,
        phone: user.phone,
        cars: data.cars,
        address: data.address,
        price: data.price,
        worker: estimate.worker,
        carpark: data.carpark,
        drive_time: estimate.drive_time,
        wash_time: estimate.wash_time,
        finish_time: estimate.finish_time
      });
    });
  }).fail(popMessage);

});

if(!user.cars.length){
  $(".cars .add").trigger("touchend");
}else{
  $(".blank").hide();
  $("body").css("position","static");
}
require.async("./addcar.js",function(){});
require.async("./preorder.js",function(){});

}, {
    entries:entries,
    map:mix({"./mod/autocomplete":_4,"./mod/singleselect":_9,"./mod/popselect":_8,"./mod/popmessage":_7},globalMap)
});

define(_4, [_21,_24,_25], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var util = require("util");
var events = require("events");

function Autocomplete(input, pattern, parser, getVal){
  input = $(input);
  var self = this;
  var list = $("<ul class='autocomplete' />");
  this.list = list;
  input.after(list);
  var delay = 350;
  var timeout = null;
  parser = parser || function(item){return item;}
  getVal = getVal || function(item){return item;}
  var needRequest = function(value){
    return value.match(/\w{3,}/) || value.match(/[\u4e00-\u9fa5]{1,}/);
  }

  input.on("keyup", function(){
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      var value = input.val().trim();
      if(!needRequest(value)){return;}
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",value)
      }).done(function(data){
        if(!data.length){return;}
        list.empty();
        data.map(parser).forEach(function(item,i){
          var li = $("<li>" + item + "</li>");
          li.on("touchend",function(){
            input.val(getVal(data[i]));
            self.emit("select",data[i]);
            self.hide();
          });
          $(list).append(li);
        });
        var packup = $("<li class='packup'>收起</li>");
        packup.on("touchend",function(){
          self.hide();
        });
        list.append(packup);
        self.show();
      }).fail(function(){
        console.log("failed");
      });
    },delay);
  });
}

util.inherits(Autocomplete, events);

Autocomplete.prototype.show = function(){
  this.list.show();
}


Autocomplete.prototype.hide = function(){
  this.list.hide();
}


exports.init = function(input, parser, getVal){
  var pattern = input.attr("data-pattern");
  if(!pattern){return;}
  return new Autocomplete(input, pattern, parser, getVal);
}
}, {
    entries:entries,
    map:globalMap
});

define(_9, [_21,_25,_24], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var events = require("events");
var util = require("util");

function SingleSelect(elem,selector){
  var self = this;
  (function(){
    var current = null;
    var items = self.items = elem.find(selector);
    items.on("touchend",function(){
      elem.find(".active").removeClass("active");
      var me = $(this);
      if(me == current){
        me.removeClass("active");
        current = null;
      }else{
        current && current.removeClass("active");
        me.addClass("active");
        current = me;
      }
      self.emit("change",this);
    });
  })();
  return this;
}

util.inherits(SingleSelect,events);

SingleSelect.prototype.select = function(data){
  this.items.filter(function(i){
    return JSON.stringify($(this).data("data")) == JSON.stringify(data);
  }).addClass("active");
}

module.exports = function(elem,selector){
  return new SingleSelect(elem,selector);
}
}, {
    entries:entries,
    map:globalMap
});

define(_8, [_21,_25,_24,_9,_6], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var singleSelect = require("./singleselect");
var multiSelect = require("./multiselect");
var events = require("events");
var util = require("util");

function PopSelect(choices, options){
  this.parser = options.parser || function(v){return v;}
  this.choices = choices;
  this.type = options.type;
  this.name = options.name;
  var container = this.container =  $("<div class='popselect'>"
      +"<div class='close'></div>"
      +"<div class='choices'>"
      +"<div class='inner'></div>"
      +"</div>"
    +"<div class='btn submit'>确认</div>"
  +"</div>");
  this.render();
  this.bind();
  var doc_height = $(window).height();
  container.css("max-height",doc_height - 40);
  container.find(".inner").css("max-height",doc_height - 200);
  container.appendTo($("body"));
  container.hide();
  this.name && container.addClass(this.name);
}

util.inherits(PopSelect,events);


PopSelect.prototype.render = function() {
  var self = this;
  var parser = this.parser;
  var container = this.container;

  var choices_elem = container.find(".choices .inner");
  choices_elem.empty();
  this.choices.forEach(function(choice){
    var text = parser(choice);
    var item = $("<div class='item'>" + text + "</div>");
    item.data("data",choice);
    choices_elem.append(item);
  });

  switch(this.type){
    case "single":
      this.selector = singleSelect(choices_elem,".item");
      break;
    case "multi":
      this.selector = multiSelect(choices_elem,".item");
      break;
    default:
      throw "invalid type " + this.type;
  }
};

PopSelect.prototype.bind = function(){
  var self = this;
  var container = this.container;
  container.find(".submit").on("touchend",function(){
    var result = container.find(".active").map(function(i,el){
      return $(el).data("data");
    });

    self.emit("submit", Array.prototype.slice.call(result));
    self.close();
  });

  container.find(".close").on("touchend",function(){
    self.close();
  });
}

PopSelect.prototype.select = function(item){
  this.selector.select(item);
}

PopSelect.prototype.add = function(data){
  this.choices.push(data);
  this.render();
}

PopSelect.prototype.open = function(){
  this.container.show();
  this.emit("open");
}

PopSelect.prototype.close = function(){
  this.container.hide();
  this.emit("close");
}

module.exports = function(choices,options){
  return new PopSelect(choices,options);
}
}, {
    entries:entries,
    map:mix({"./singleselect":_9,"./multiselect":_6},globalMap)
});

define(_7, [_21], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
function popMessage(message){
  var json = {}
  if(message.constructor == XMLHttpRequest){
    try{
      json = JSON.parse(message.responseText);
    }catch(e){
      json = {
        error:{
          message: message.responseText
        }
      }
    }
  }else if(typeof message == "string"){
    json = {
      error:{
        message:message
      }
    };
  }

  var text = json.error && json.error.message;

  var pop = $("<div>" + text + "</div>");
  pop.css({
    position:"fixed",
    opacity:"0",
    transition:"opacity linear .4s",
    top: "140px",
    left: "50%",
    zIndex: "30",
    padding: "10px 25px",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius:"5px"
  });
  pop.appendTo($("body"));
  var width = pop.width()
    // + ["padding-left","padding-right","border-left","border-right"].map(function(prop){
    //   return parseInt(pop.css(prop));
    // }).reduce(function(a,b){
    //   return a+b;
    // },0);
  pop.css({
    "margin-left": - width / 2
  });
  setTimeout(function(){
    pop.css({
      "opacity":1
    });
  });
  setTimeout(function(){
    pop.css({
      "opacity":0
    });
    setTimeout(function(){
      pop.remove();
    },400);
  },1500)
}

module.exports = popMessage
}, {
    entries:entries,
    map:globalMap
});

define(_6, [_21], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function MultiSelect(container,itemSelector){
  container = $(container);
  var items = this.items = container.find(itemSelector);
  items.each(function(i,item){
    $(item).on("touchend",function(){
      $(this).toggleClass("active");
    })
  });
  return this;
}

MultiSelect.prototype.select = function(dataList){
  var items = this.items;
  var jsonList = dataList.map(function(data){return JSON.stringify(data);});
  dataList.forEach(function(data){
    items.filter(function(i){
      return JSON.stringify($(this).data("data")) == JSON.stringify(data);
    }).addClass("active");
  });
};


module.exports = function(container,itemSelector){
  return new MultiSelect(container,itemSelector);
}
}, {
    entries:entries,
    map:globalMap
});
})();