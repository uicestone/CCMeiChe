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
var _22 = "events@^1.0.5";
var _23 = "util@^1.0.4";
var _24 = "tpl@~0.2.1";
var _25 = "view-swipe@~0.1.4";
var _26 = "uploader@~0.1.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_1, [_21,_22,_23,_24,_25,_18,_11,_9,_7], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var template = require("./tpl/finishorder.html");
var uploader = require("./mod/uploader");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");
var singleSelect = require("./mod/singleselect");
var popMessage = require("./mod/popmessage");
var uploading = false;

function FinishOrder(){

}

util.inherits(FinishOrder,events);

FinishOrder.prototype.show = function(data){
  var html = tpl.render(template,data);
  var elem = $(html);
  var self = this;
  viewSwipe.in(elem[0],"bottom");

  uploader.init(".add-photo:eq(0)",{
    type:"multiple",
    prefix:"carwash/",
    queueTarget:$(".finish_photos")
  }).on("add",function(){
    uploading = true;
  }).on("complete",function(){
    uploading = false;
  });

  uploader.init(".add-photo:eq(1)",{
    type:"multiple",
    prefix:"carbreak/",
    queueTarget:$(".breakage_photos")
  }).on("add",function(){
    uploading = true;
  }).on("complete",function(){
    uploading = false;
  });

  $('.breakage img').each(function(){
      var $img = jQuery(this);
      var imgID = $img.attr('id');
      var imgClass = $img.attr('class');
      var imgURL = $img.attr('src');

      jQuery.get(imgURL, function(data) {
          // Get the SVG tag, ignore the rest
          var $svg = jQuery(data).find('svg');

          // Add replaced image's ID to the new SVG
          if(typeof imgID !== 'undefined') {
              $svg = $svg.attr('id', imgID);
          }
          // Add replaced image's classes to the new SVG
          if(typeof imgClass !== 'undefined') {
              $svg = $svg.attr('class', imgClass+' replaced-svg');
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          $svg = $svg.removeAttr('xmlns:a');

          // Replace image with new SVG
          $img.replaceWith($svg);

      }, 'xml');

  });


  elem.find(".submit").on("touchend", function(){
    self.confirm();
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel");
    viewSwipe.out("bottom");
  });

  singleSelect($("#finishorder"),".breakage");

  return this;
}

FinishOrder.prototype.confirm = function(){
  if(uploading){
    return popMessage("图片尚未上传完毕，请稍等");
  }
  var data = {
    finish_pics: $(".finish_photos li").get().map(function(el){
      return $(el).attr("data-key");
    }),
    breakage_pics: $(".breakage_photos li").get().map(function(el){
      return $(el).attr("data-key");
    })
  };

  var breakage = $(".breakages .active").attr("data-index");

  if(breakage){
    data.breakage = breakage;
  }

  if(!data.finish_pics.length){
    return popMessage("请上传车辆照片");
  }

  if(data.breakage && !data.breakage_pics.length){
    return popMessage("请上传车损照片");
  }

  viewSwipe.out("bottom");
  this.emit("confirm",data);
}

module.exports = new FinishOrder();
}, {
    entries:entries,
    map:mix({"./tpl/finishorder.html":_18,"./mod/uploader":_11,"./mod/singleselect":_9,"./mod/popmessage":_7},globalMap)
});

define(_18, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="finishorder" class="container"><h2 class="h2">洗车已完成</h2><ul class="photo-list finish_photos"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><h2 class="h2">车损部位</h2><ul class="breakages"><li data-index="1" class="breakage breakage-1"><img src="/img/breakages/icon-1.svg" width="100%"/></li><li data-index="2" class="breakage breakage-2"><img src="/img/breakages/icon-2.svg" width="100%"/></li><li data-index="3" class="breakage breakage-3"><img src="/img/breakages/icon-3.svg" width="100%"/></li><li data-index="4" class="breakage breakage-4"><img src="/img/breakages/icon-4.svg" width="100%"/></li><li data-index="5" class="breakage breakage-5"><img src="/img/breakages/icon-5.svg" width="100%"/></li><li data-index="6" class="breakage breakage-6"><img src="/img/breakages/icon-6.svg" width="100%"/></li><li data-index="7" class="breakage breakage-7"><img src="/img/breakages/icon-7.svg" width="100%"/></li><li data-index="8" class="breakage breakage-8"><img src="/img/breakages/icon-8.svg" width="100%"/></li><li data-index="9" class="breakage breakage-9"><img src="/img/breakages/icon-9.svg" width="100%"/></li><li data-index="10" class="breakage breakage-10"><img src="/img/breakages/icon-10.svg" width="100%"/></li></ul><ul class="photo-list breakage_photos"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><input type="button" value="完成" class="button submit"/><input type="button" value="取消" class="button cancel"/></div>'
}, {
    entries:entries,
    map:globalMap
});

define(_11, [_21,_26], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var Uploader = require('uploader');

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
    maxItems: type == "single" ? -1 : 2
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

define(_9, [_21,_22,_23], function(require, exports, module, __filename, __dirname) {
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
})();