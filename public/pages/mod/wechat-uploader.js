var $ = require('zepto');
var util = require('util');
var events = require('events');
var attributes = require('attributes');
var _ = require('underscore');
var uuid = 0;
module.exports = WechatUploader;

function WechatLocalFile(localId){
  this.localId = localId;
  this.name = "untitled.jpg";
  this.id = -1;
}

/**
 * @name WechatUploader
 * @class 微信方案上传
 * @constructor
 * @requires UploadType
 */
function WechatUploader(elem, config) {
  elem = $(elem);
  var self = this;

  this.files = [];
  this.set('config', config);
  elem.on('click',function(){
    if(self.get("isDisabled")){
      return false;
    }else{
      self._choose();
    }
  });
  self.on("_wxchoose", function(localIds){
    for (var i = 0; i < localIds.length; i++) {
      var file = new WechatLocalFile(localIds[i]);;
      file.id = uuid++;
      self.files.push(file);
    }

    self.emit('select', {
      files: self.files
    });
  });

  self.on("success", function(){
    self.files.shift();
  });

  wx.ready(function(){
    self.emit('load');
  });
}

util.inherits(WechatUploader, events);

WechatUploader.prototype._choose = function(){
  var self = this;
  wx.chooseImage({
    success: function (res) {
      var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      self.emit("_wxchoose", localIds);
    },
    fail: function(res){
      self.emit('error',JSON.stringify(res))
    }
  });
}

WechatUploader.prototype.setDisabled = function(isDisabled){
  this.set("isDisabled",isDisabled);
};

WechatUploader.prototype.setFileTypes = function(extensions) {};

WechatUploader.prototype.transfer = function(file){
  var self = this;
  var serverId = file.serverId;
  $.ajax({
    url:"/api/v1/transfer-image",
    type:"post",
    data:{
      serverId: serverId
    },
    success: function(data){
      self.emit("success", {
        file: file,
        data: data
      });
    },
    fail: function(data){
      self.emit("error", "transfer fail");
    }
  });
}

WechatUploader.prototype.upload = function (file) {
  var self = this;
  var file = _.filter(this.files,function(file){
    return file.status == "waiting";
  })[0];

  var config = this.get('config');
  var data = this.get('data');
  var self = this;

  wx.uploadImage({
    localId: file.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
    isShowProgressTips: 0, // 默认为1，显示进度提示
    success: function (res) {
      file.serverId = res.serverId; // 返回图片的服务器端ID
      self.transfer(file);
    },
    fail: function(res){
      self.emit('error', {
        file:file,
        message: JSON.stringify(res)
      });
    }
  });
};

WechatUploader.prototype.setData = function (data) {
  this.set('data', data);
};

attributes.patch(WechatUploader, {
  config: {
    value: {}
  },
  data: {
    value: {}
  },
  isDisabled:{
    value: false
  }
});