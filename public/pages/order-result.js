var $ = require('zepto');
var popMessage = require('./mod/popmessage');

function postShare(){
  if(order.status == "done"){
    $.post('/api/v1/myorders/share',{
      orderId: order._id
    },'json').done(function(result){
      if(result.message == "ok"){
        popMessage("分享成功，将获得5积分");
      }
    });
  }
}

var shareData = {
  "imgUrl": appConfig.qiniu_host + order.finish_pics[0] + "?imageView/2/w/96/h/96",
  "link": location.href,
  "desc":'我刚刚在CC美车完成了洗车，获得5积分，你也来试试吧',
  "title":"我刚刚在CC美车完成了洗车，获得5积分，你也来试试吧"
};

WeixinApi.ready(function(Api){
  // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
  Api.shareToFriend(shareData, {
    confirm:function (resp) {
      window.ga && ga('send', 'event', 'share', 'timeline');
      postShare();
    }
  });
  // 点击分享到朋友圈，会执行下面这个代码
  Api.shareToTimeline(shareData, {
    confirm:function (resp) {
      window.ga && ga('send', 'event', 'share', 'timeline');
      postShare();
    }
  });
});