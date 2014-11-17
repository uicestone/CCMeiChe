(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _4 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _5 = "ccmeiche@0.1.0/pages/mod/input-clear.js";
var _6 = "ccmeiche@0.1.0/pages/mod/menu.js";
var _7 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _9 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _11 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _12 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _13 = "ccmeiche@0.1.0/pages/myinfos.js";
var _14 = "ccmeiche@0.1.0/pages/myorders.js";
var _15 = "ccmeiche@0.1.0/pages/order-result.js";
var _16 = "ccmeiche@0.1.0/pages/order.js";
var _17 = "ccmeiche@0.1.0/pages/promos.js";
var _18 = "ccmeiche@0.1.0/pages/recharge.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/agreement.html.js";
var _21 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _22 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _23 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _24 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _25 = "ccmeiche@0.1.0/pages/views/agreement.js";
var _26 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _27 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _28 = "zepto@^1.1.3";
var _29 = "tpl@~0.2.1";
var _30 = "hashstate@~0.1.0";
var _31 = "util@^1.0.4";
var _32 = "events@^1.0.5";
var _33 = "view-swipe@~0.1.4";
var _34 = "uploader-mobile@~0.1.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25,_26,_27];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_0, [_28,_29,_30,_3,_10,_9,_8,_24,_27,_5], function(require, exports, module, __filename, __dirname) {
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
  if(mypromo && mypromo.amount){
    $(".promo").removeClass("disabled");
    var html = "";
    $(".promo .num .text").html(1);
    for(var i = 0; i < mypromo.amount + 1; i++){
      if(i==1){
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
      count = count - credit;
      credit = 0;
    }else{
      credit = credit - count;
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
  $("#latlng").val(latlng);
  $.get("/api/v1/location/latlng/" + latlng, function(data){
    $(".location .input").val(data.result.pois[0].name);
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
  $.post("/api/v1/estimate", {
    latlng: order.latlng
  },"json").done(function(result){
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
  }).fail(function(xhr){
    popMessage(xhr);
    el.prop("disabled",false);
  });

});

if(!user.cars.length){
  $(".cars .add").trigger("click");
}else{
  $(".blank").hide();
  $("body").css("position","static");
}

}, {
    entries:entries,
    map:mix({"./mod/autocomplete":_3,"./mod/singleselect":_10,"./mod/popselect":_9,"./mod/popmessage":_8,"./views/addcar":_24,"./views/preorder":_27,"./mod/input-clear":_5},globalMap)
});

define(_3, [_28,_31,_32], function(require, exports, module, __filename, __dirname) {
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
  parser = parser || function(item){return item;}
  getVal = getVal || function(item){return item;}
  var needRequest = function(value){
    return value.match(/\w{1,}/) || value.match(/[\u4e00-\u9fa5]{1,}/);
  }

  function Watcher(options){
    var interval = this.interval = options.interval;
    var getter = this.getter = options.getter;
    var oldValue = this.oldValue = getter();
  }

  util.inherits(Watcher,events);
  Watcher.prototype.start = function(){
    this.stop();
    var self = this;
    self.itv = setInterval(function(){
      var v = self.getter();
      if(v !== self.oldValue){
        self.emit("change",v,self.oldValue);
      }
      self.oldValue = v;
    },self.interval);
  };
  Watcher.prototype.stop = function(){
    var self = this;
    clearInterval(this.itv);
  };

  var watcher = this.watcher = new Watcher({
    interval: 100,
    getter: function(){
      return input.val().trim();
    }
  });

  input.on("focus",function(){
    watcher.start();
  });

  watcher.on('change', function(v){
      if(!needRequest(v)){return;}
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",encodeURIComponent(v))
      }).done(function(data){
        if(!data.length){return;}
        list.empty();
        data.map(parser).forEach(function(item,i){
          var li = $("<li>" + item + "</li>");
          li.on("tap",function(){
            input.val(getVal(data[i]));
            self.emit("select",data[i]);
            watcher.stop();
            self.hide();
          });
          $(list).append(li);
        });
        var packup = $("<li class='packup'>收起</li>");
        packup.on("tap",function(){
          self.hide();
        });
        list.append(packup);
        self.show();
      }).fail(function(){
        console.log("failed");
      });
  });
}

util.inherits(Autocomplete, events);

Autocomplete.prototype.show = function(){
  this.list.show();
}

Autocomplete.prototype.stopWatch = function(){
  this.watcher.stop();
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

define(_10, [_28,_32,_31], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var events = require("events");
var util = require("util");

function SingleSelect(elem,selector){
  var self = this;
  (function(){
    var current = null;
    var items = self.items = elem.find(selector);
    items.on("tap",function(){
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

define(_9, [_28,_32,_31,_10,_7], function(require, exports, module, __filename, __dirname) {
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
  container.find(".submit").on("tap",function(){
    var result = container.find(".active").map(function(i,el){
      return $(el).data("data");
    });
    if(!self.validate || self.validate(result)){
      self.emit("submit", Array.prototype.slice.call(result));
      self.close();
    }
  });

  container.find(".close").on("tap",function(){
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
    map:mix({"./singleselect":_10,"./multiselect":_7},globalMap)
});

define(_8, [_28], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
function popMessage(message, styles, notDismiss){
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
    borderRadius:"5px",
    width: "200px"
  });
  pop.css(styles || {});
  pop.appendTo($("body"));
  var width = pop.width();
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
  if(!notDismiss){
  setTimeout(function(){
    pop.css({
      "opacity":0
    });
    setTimeout(function(){
      pop.remove();
    },400);
  },2000);
  }
}

module.exports = popMessage
}, {
    entries:entries,
    map:globalMap
});

define(_24, [_28,_12,_3,_8,_11,_5,_19], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var uploader = require("../mod/uploader");
var autocomplete = require("../mod/autocomplete");
var popMessage = require("../mod/popmessage");
var swipeModal = require("../mod/swipe-modal");
var inputClear = require("../mod/input-clear");

module.exports = swipeModal.create({
  button: $(".addcar"),
  template:  require("../tpl/addcar.html"),
  show: function(data){
    var elem = this.elem;

    uploader.init(".add-photo",{
      type:"single",
      prefix:"userpic/"
    });

    elem.find(".input").each(function(){
      var input = $(this);
      autocomplete.init(input);
      var ph = input.attr("placeholder");
      input.on("focus",function(){
        if(!input.val()){
          input.attr("placeholder","");
        }
      }).on("blur",function(){
        if(!input.val()){
          input.attr("placeholder",ph);
        }
      });
    });

    if(!user.cars.length){
      elem.find(".cancel").hide();
      elem.find(".submit").css('float','none');
    }

    inputClear(elem.find(".type"));
    inputClear(elem.find(".number"));
    inputClear(elem.find(".color"));
    inputClear(elem.find(".comment"));

    if(data){
      if(data.pic){
        var img = $("<img />").attr('src',
          appConfig.qiniu_host
          + data.pic
          + "?imageView/1/w/155/h/105"
        );
        var result_elem = elem.find(".result");
        elem.find(".text").hide();
        result_elem.attr("data-key", data.pic);
        result_elem.empty().append(img);
      }

      elem.find(".type .input").val(data.type||"");
      elem.find(".number .input").val(data.number||"");
      elem.find(".color .input").val(data.color||"");
      elem.find(".comment .input").val(data.comment||"");
      elem.data("index",data.index);
    }
  },
  getData: function(){
    var elem = this.elem;
    var index = elem.data("index");
    var data = {
      pic: elem.find(".result").attr("data-key"),
      type: elem.find(".type input").val(),
      color: elem.find(".color input").val(),
      number: elem.find(".number input").val(),
      comment: elem.find(".comment input").val()
    };
    if(index !== undefined){
      data.index = index;
    }
    return data;
  },
  validate: function(data){
    if(!data.type){
      popMessage("请填写车型");
      return;
    }
    if(!data.number){
      popMessage("请填写车号");
      return;
    }
    if(!data.color){
      popMessage("请填写颜色");
      return;
    }

    // if(!/^[\u4e00-\u9fa5]{1}[A-Z0-9]{6}$/.test(data.number)){
    //   popMessage("车号格式无效");
    //   return;
    // }

    return true
  },
  submit: function(data,callback){
    $.post("/api/v1/mycars",data,"json").done(function(){
      callback(data);
    }).fail(popMessage);
  }
});
}, {
    entries:entries,
    map:mix({"../mod/uploader":_12,"../mod/autocomplete":_3,"../mod/popmessage":_8,"../mod/swipe-modal":_11,"../mod/input-clear":_5,"../tpl/addcar.html":_19},globalMap)
});

define(_27, [_28,_33,_11,_8,_23], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var viewSwipe = require("view-swipe");
var swipeModal = require("../mod/swipe-modal");
var popMessage = require("../mod/popmessage");

var preorderPanel = swipeModal.create({
  button: $("#go-wash"),
  template:  require("../tpl/preorder.html"),
  santitize: function(data){
    data.time = formatTime(data.finish_time);
    return data;
  },
  getData: function(){
    return {
      data: this.data,
      order: this.order
    };
  },
  submit: function(config,callback){
    popMessage("请求支付中");
    var order = config.order;
    var data = config.data;

    $.post("/api/v1/myorders/confirm", order, 'json').done(function(result){
      if(result.code == 200){
        location.href = "/myorders";
      }else if(result.code == 201){
        if(appConfig.env !== "product"){
          $.post("/wechat/notify",{
            orderId: result.orderId,
            type: "washcar"
          },'json').done(function(){
            location.href = "/myorders";
          }).fail(popMessage);
        }else{
          // require payment
          WeixinJSBridge.invoke('getBrandWCPayRequest', result.payargs, function(res){
            var message = res.err_msg;
            if(message == "get_brand_wcpay_request:ok"){
              popMessage("支付成功，正在跳转");
              location.href = "/myorders";
            }else{
              popMessage("支付失败，请重试");
              self.emit("cancel",order,message);
            }
          });
        }
      }
    });
  }
});

module.exports = preorderPanel;

function formatTime(estimated_finish_time){
  function addZero(num){
    return num < 10 ? ("0" + num) : num;
  }

  var hour = 1000 * 60 * 60;
  var minute = 1000 * 60;
  var second = 1000;

  var milliseconds = +new Date(estimated_finish_time) - +new Date();

  var hours = Math.floor(milliseconds / hour);
  milliseconds = milliseconds - hours * hour;
  var minutes = Math.floor(milliseconds / minute);
  milliseconds = milliseconds - minutes * minute;
  var seconds = Math.floor(milliseconds / second);

  hours = hours ? ( addZero(hours) + "小时" ) : "";
  return hours + addZero(minutes) + "分钟" + addZero(seconds) + "秒";
}
}, {
    entries:entries,
    map:mix({"../mod/swipe-modal":_11,"../mod/popmessage":_8,"../tpl/preorder.html":_23},globalMap)
});

define(_5, [_28], function(require, exports, module, __filename, __dirname) {
$ = require('zepto');

function inputClear(wrap){
  var input = wrap.find(".input");
  var clear = $('<div class="clear" />');
  wrap.addClass('clear-input-wrap');
  clear.appendTo(wrap);
  clear.hide();

  input.on('focus', function(){
    if(input.val()){
      clear.show();
    }
  });
  input.on('keyup', function(){
    if(input.val()){
      clear.show();
    }else{
      clear.hide();
    }
  });
  clear.on('tap', function(e){
    e.preventDefault();
    input.val("");
    clear.hide();
  });
  input.on('blur', function(){
    clear.hide();
  });
}

module.exports = inputClear;
}, {
    entries:entries,
    map:globalMap
});

define(_7, [_28], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function MultiSelect(container,itemSelector){
  container = $(container);
  var items = this.items = container.find(itemSelector);
  items.each(function(i,item){
    $(item).on("tap",function(){
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

define(_12, [_28,_34], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var Uploader = require('uploader-mobile');

var beforeUpload = function(prefix){
  return function(file, done){
    var uploader = this;
    $.ajax({
      url:"/api/v1/uploadtoken",
      dataType:"json",
      success:function(json){
        var fileName = json.fileName; // random file name generated
        var token = json.token;
        uploader.set('data',{
          token: token,
          key: prefix + fileName + file.ext
        });
        done();
      }
    });
  }
}

var loadImageToElem = function(key, elem, size, callback){
  var imgSrc = appConfig.qiniu_host
    + key
    + "?imageView/"
    + size.mode
    + "/w/"
    + size.width
    + (size.height ? ("/h/" + size.height) : "");
  var img = $("<img />").attr("src",imgSrc);
  if(!elem){return;}
  img.on('load',function(){
      elem.append(img);
      elem.attr("data-key",key);
      img.css("display","none");
      img.css({
        display: 'block',
        opacity: 1
      });
      callback && callback();
  });
};

var uploadTemplate = {
  template: '<li id="J_upload_item_<%=id%>" class="pic-wrapper"></li>',
  add: function(e){
    initloading(e.elem);
  },
  success: function(e){
    var elem = e.elem;
    var data = e.data;
    loadImageToElem(data.key, elem, {
      mode: 2,
      width: 260
    },function(){
      elem.find(".loading").hide();
    });
  },
  remove: function(e){
      var elem = e.elem;
      elem && elem.fadeOut();
  },
  error: function(e){
      console && console.log("e")
  }
};

function initloading(elem){
  var loading = $("<div class='loading'><div class='spin'></div></div>");
  var spin = loading.find(".spin");
  elem.append(loading);
  var i = 0;
  setInterval(function(){
    spin.css("background-position","0 " + (i%8) * 40 + "px")
    i++;
  },100);
  return loading;
}

exports.init = function(selector,options){
  var type = options.type;
  var uploader =  new Uploader(selector, {
    action:"http://up.qiniu.com",
    name:"file",
    queueTarget: options.queueTarget,
    theme: type == "single" ? null : uploadTemplate,
    beforeUpload: beforeUpload(options.prefix || ""),
    allowExtensions: ["png","jpg"],
    maxSize: "500K",
    maxItems: type == "single" ? -1 : options.maxItems
  });

  var elem = $(selector);
  var result = $("<div class='result'></div>");
  if(options.type == "single"){
    initloading(elem.find(".area"));
    elem.find(".area").append(result);
    uploader.on("add",function(){
      result.empty();
      elem.find(".text").hide();
      elem.find(".result").hide();
      elem.find(".loading").show();
    }).on("success",function(e){
      loadImageToElem(e.data.key, result, {
        mode: 1,
        width: 155,
        height: 105
      }, function(){
        elem.find(".loading").hide();
        elem.find(".result").show();
      });
    })
  }else{
    uploader.on("disable",function(){
      elem.hide();
    });
  }

  return uploader;
}
}, {
    entries:entries,
    map:globalMap
});

define(_11, [_31,_32,_33,_29,_30,_28], function(require, exports, module, __filename, __dirname) {
var util = require("util");
var events = require("events");
var viewSwipe = require("view-swipe");
var tpl = require("tpl");
var hashState = require('hashstate')();
var $ = require("zepto");

var i = 1;


function SwipeModal(config){
  var self = this;
  var getData = this.getData = config.getData;
  var validate = this.validate = config.validate || function(){return true};
  var button = this.button = config.button;
  this.config = config;
  this.name = config.name || "swipe-modal-" + i;
  this._show = config.show;
  i++;

  hashState.on('hashchange', function(e){
    if(!e.newHash){
      viewReturn();
    }
  });

  function viewReturn(){
    hashState.setHash("");
    $("body>.container,body>.wrap").css("display","block");
    $("body").css("position","fixed");
    $(".swipe-container").css("position","fixed");
    setTimeout(function(){
      $("body").css("position","");
    },300);

    viewSwipe.out("bottom");
    button.prop("disabled",false);
  }

  function viewCome(){
    var elem = self.elem;
    setTimeout(function(){
      $("body>.container,body>.wrap").css("display","none");
      $(".swipe-container").css("position","relative");
    },300);
    viewSwipe.in(elem[0],"bottom");
    button.prop("disabled",true);
  }

  self.on("show",viewCome);
  self.on("submit",viewReturn);
  self.on("cancel",viewReturn);

}

util.inherits(SwipeModal,events);
SwipeModal.prototype.santitize = function(data){
  return (this.config.santitize || function(v){return v}).bind(this)(data);
}
SwipeModal.prototype.show = function(data){
  data = this.santitize(data);
  var self = this;
  var config = this.config;
  var submit = config.submit;
  var cancel = config.cancel;
  var elem = this.elem = $(tpl.render(config.template,data));
  elem.find(".submit").on("tap",function(){
    var data = self.getData();
    var isValid = self.validate(data);

    if(isValid){
      if(!submit){
        self.emit("submit",data);
      }else{
        submit.bind(self)(data,function(result){
          self.emit("submit",result);
        });
      }
    }
  });

  elem.find(".cancel").on("tap", function(){
    self.emit("cancel");
  });

  hashState.setHash(this.name);
  this.emit("show");
  this._show && this._show(data);
}

exports.create = function(config){
  return new SwipeModal(config);
}
}, {
    entries:entries,
    map:globalMap
});

define(_19, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="addcar" class="container"><h2 class="h2">我的车辆信息</h2><ul class="upload-list"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><div class="row type"><input placeholder="车型" data-pattern="/api/v1/cartypes/{q}" class="input"/><i class="icon"></i></div><div class="row number"><input placeholder="号牌" class="input"/><i class="icon"></i></div><div class="row color"><input placeholder="颜色" class="input"/><i class="icon"></i></div><div class="row comment"><input placeholder="备注" class="input"/><i class="icon"></i></div><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});

define(_23, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="preorder" class="container"><h2 class="h2">提交订单</h2><div class="order"><div class="inner"><div class="row"><div class="label">手机：</div><div class="text">@{it.phone}</div></div><?js it.cars.forEach(function(car,index){ ?><div class="row"><div class="label"><?js if(index == 0){ ?>车型：<?js }else{ ?>   <?js } ?></div><div class="text"><p>@{car.type}</p><p>@{car.number}</p></div></div><?js }); ?><div class="row"><div class="label">地址：</div><div class="text">@{it.address} @{it.carpark}</div></div><div class="row"><div class="label">服务：</div><div class="text">@{it.service.title}</div></div></div></div><h2 class="h2">预估时间</h2><div class="estimate"><div class="time">@{it.time}</div><div class="text"><p>我们将在预估时间内完成洗车，预估时间以付款后为准</p><p>您也可在我们达到前随时取消订单</p></div></div><h2 class="h2">应付金额<div class="price">￥@{it.price}</div></h2><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();