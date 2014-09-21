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
      if(appConfig.env !== "product"){
        $.post("/wechat/notify",{
          orderId: result.orderId,
          type: "washcar"
        },'json').done(function(){
          location.href = "/myorders";
        }).fail(popMessage);
      }else{
        WeixinJSBridge.invoke('getBrandWCPayRequest', result, function(res){
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