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
var _29 = "uploader-mobile@~0.1.5";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25,_26,_27];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_12, [_28,_29,_8], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var Uploader = require('uploader-mobile');
var popMessage = require('./popmessage');
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
    }
  };

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
  }).on("select",function(e){
    window.onerror("选择文件", e.files.map(function(file){
      return file.name + " " + Math.round(file.size / 1024) + "KB";
    }).join(","),'');
  }).on("error", function(e){
    if(type == "single"){
      elem.find(".loading").hide();
      elem.find(".text").show();
    }
    popMessage("上传失败，请重试");
    e.elem.remove();
    window.onerror("上传失败",JSON.stringify({code:e.code,message:e.message}),'');
  }).on("success", function(e){
    console.log(e);
    window.onerror("上传成功",appConfig.qiniu_host + e.data.key,'');
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
    });
  }else{
    uploader.on("disable",function(){
      elem.hide();
    });
  }

  return uploader;
}
}, {
    entries:entries,
    map:mix({"./popmessage":_8},globalMap)
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
  }).addClass("popmessage");
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
})();