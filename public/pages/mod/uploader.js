var $ = require('zepto');
var Uploader = require('uploader');

function beforeUpload(file, done){
  var uploader = this;
  $.ajax({
    url:"/api/v1/uploadtoken",
    dataType:"json",
    success:function(json){
      var fileName = json.fileName; // random file name generated
      var token = json.token;
      uploader.set('data',{
        token: token,
        key:"userpic/" + fileName + file.ext
      });
      done();
    }
  });
}

var uploadTemplate = {
  template: '<li id="J_upload_item_<%=id%>" class="pic-wrapper">'
      +'<div class="pic"><div class="percent"></div></div>'
      +'<div class="icon-delete J_upload_remove" />'
  +'</li>',
  success: function(e){
      var elem = e.elem;
      var data = e.data;
      var imgSrc = appConfig.qiniu_host + data.key + "?imageView/1/w/90/h/90";
      var img = $("<img />").attr("src",imgSrc);
      if(!elem){return;}
      img.on('load',function(){
          elem.find(".percent").remove();
          elem.find(".pic").append(img);
          elem.attr("data-key",data.key);
          img.css("display","none");
          img.css({
            display: 'block',
            opacity:0
          }).animate({
            opacity: 1
          }, 500);
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

exports.init = function(selector){
  new Uploader(selector, {
    action:"http://up.qiniu.com",
    name:"file",
    queueTarget:".upload-list",
    theme: uploadTemplate,
    beforeUpload: beforeUpload,
    allowExtensions: ["png","jpg"],
    maxSize: "500K",
    maxItems: 4
  });
}