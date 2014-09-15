(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _3 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _4 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _5 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _6 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _8 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _9 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _10 = "ccmeiche@0.1.0/pages/myinfos.js";
var _11 = "ccmeiche@0.1.0/pages/myorders.js";
var _12 = "ccmeiche@0.1.0/pages/order.js";
var _13 = "ccmeiche@0.1.0/pages/recharge.js";
var _14 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _15 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _19 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _20 = "ccmeiche@0.1.0/pages/views/preorder.js";
var _21 = "zepto@^1.1.3";
var _22 = "view-swipe@~0.1.4";
var _23 = "util@^1.0.4";
var _24 = "events@^1.0.5";
var _25 = "tpl@~0.2.1";
var _26 = "hashstate@~0.1.0";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_20, [_21,_22,_8,_5,_17], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var viewSwipe = require("view-swipe");
var swipeModal = require("../mod/swipe-modal");
var popMessage = require("../mod/popmessage");

var preorderPanel = swipeModal.create({
  button: $("#go-wash"),
  template:  require("../tpl/preorder.html"),
  santitize: function(order){
    this.order = order;
    var data = {};
    for(var k in order){
      data[k] = order[k];
    }
    data.time = formatTime(data);
    return data;
  },
  getData: function(){
    return this.order;
  },
  submit: function(order,callback){
    popMessage("请求支付中");

    $.post("/api/v1/myorders/confirm",{
      "orderId": order._id
    },'json').done(function(paymentargs){
      if(appConfig.env !== "product"){
        $.post("/wechat/notify",{
          orderId: order._id,
          type: "washcar"
        },'json').done(function(){
          location.href = "/myorders";
        }).fail(popMessage);
      }else{
        WeixinJSBridge.invoke('getBrandWCPayRequest',paymentargs,function(res){
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
    });
  }
});

preorderPanel.on("cancel",function(reason){
  reason = reason || "preorder_cancel";
  var order = this.order;
  $.post("/api/v1/myorders/cancel",{
    "orderId": order._id,
    "reason": reason
  },'json').fail(popMessage);
});

module.exports = preorderPanel;

function formatTime(order){
  function addZero(num){
    return num < 10 ? ("0" + num) : num;
  }
  var preorder_time = order.preorder_time;
  var estimated_finish_time = order.estimated_finish_time;

  var hour = 1000 * 60 * 60;
  var minute = 1000 * 60;
  var second = 1000;

  var milliseconds = new Date(estimated_finish_time) - new Date(preorder_time);

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
    map:mix({"../mod/swipe-modal":_8,"../mod/popmessage":_5,"../tpl/preorder.html":_17},globalMap)
});

define(_8, [_23,_24,_22,_25,_26,_21], function(require, exports, module, __filename, __dirname) {
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
    $("body").css("position","static");
    viewSwipe.out("bottom");
    button.prop("disabled",false);
  }

  function viewCome(){
    var elem = self.elem;
    setTimeout(function(){
      $("body").css("position","fixed");
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
  elem.find(".submit").on("click",function(){
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

  elem.find(".cancel").on("click", function(){
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

define(_5, [_21], function(require, exports, module, __filename, __dirname) {
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

define(_17, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="preorder" class="container"><h2 class="h2">提交订单</h2><div class="order"><div class="inner"><div class="row"><div class="label">手机：</div><div class="text">@{it.user.phone}</div></div><?js it.cars.forEach(function(car,index){ ?><div class="row"><div class="label">车型：</div><div class="text"><p>@{car.type}</p><p>@{car.number}</p></div></div><?js }); ?><div class="row"><div class="label">地址：</div><div class="text">@{it.address} @{it.carpark}</div></div><div class="row"><div class="label">服务：</div><div class="text">@{it.service.title}</div></div></div></div><h2 class="h2">预估时间</h2><div class="estimate"><div class="time">@{it.time}</div><div class="text"><p>我们将在预估时间内完成洗车，预估时间以付款后为准</p><p>您也可在我们达到前随时取消订单</p></div></div><h2 class="h2">应付金额<div class="price">￥@{it.price}</div></h2><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();