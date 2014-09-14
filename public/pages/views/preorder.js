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