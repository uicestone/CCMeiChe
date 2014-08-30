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
var _10 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _11 = "ccmeiche@0.1.0/pages/myinfos.js";
var _12 = "ccmeiche@0.1.0/pages/myorders.js";
var _13 = "ccmeiche@0.1.0/pages/order.js";
var _14 = "ccmeiche@0.1.0/pages/preorder.js";
var _15 = "ccmeiche@0.1.0/pages/recharge.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _20 = "zepto@^1.1.3";
var _21 = "events@^1.0.5";
var _22 = "util@^1.0.4";
var _23 = "view-swipe@~0.1.4";
var _24 = "uploader@~0.1.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_0, [_20,_21,_22,_23,_10,_4,_16], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var uploader = require("./mod/uploader");
var autocomplete = require("./mod/autocomplete");
var template = require("./tpl/addcar.html");
var events = require("events");
var util = require("util");
var viewSwipe = require("view-swipe");



function AddCarView(){

}

util.inherits(AddCarView,events);

AddCarView.prototype.show = function(){
  var elem = $(template);
  var self = this;
  viewSwipe.in(elem[0],"bottom");
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
      input.css("text-align","left");
    }).on("blur",function(){
      if(!input.val()){
        input.attr("placeholder",ph);
        input.css("text-align","right");
      }
    });
  });

  elem.find(".submit").on("touchend", function(){
    self.submit({
      pic: elem.find(".result").attr("data-key"),
      type: elem.find(".type input").val(),
      color: elem.find(".color input").val(),
      number: elem.find(".number input").val(),
      comment: elem.find(".comment input").val()
    });
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel");
    viewSwipe.out("bottom");
  });

}

AddCarView.prototype.submit = function(data){
  var self = this;
  if(!data.pic){
    alert("请上传照片");
    return;
  }
  if(!data.type){
    alert("请填写车型");
    return;
  }
  if(!data.number){
    alert("请填写车号");
    return;
  }
  if(!data.color){
    alert("请填写颜色");
    return;
  }


  $.post("/api/v1/mycars",data,"json").done(function(){
    viewSwipe.out("bottom");
    self.emit("add",data);
  }).fail(function(xhr){
    alert(xhr.responseText);
  });

}

module.exports = new AddCarView();
}, {
    entries:entries,
    map:mix({"./mod/uploader":_10,"./mod/autocomplete":_4,"./tpl/addcar.html":_16},globalMap)
});

define(_10, [_20,_24], function(require, exports, module, __filename, __dirname) {
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

var loadImageToElem = function(key, elem, callback){
  var imgSrc = appConfig.qiniu_host + key + "?imageView/1/w/90/h/90";
  var img = $("<img />").attr("src",imgSrc);
  if(!elem){return;}
  img.on('load',function(){
      elem.append(img);
      elem.attr("data-key",key);
      img.css("display","none");
      img.css({
        display: 'block',
        opacity:1
      });
      callback && callback();
  });
};

var uploadTemplate = {
  template: '<li id="J_upload_item_<%=id%>" class="pic-wrapper">'
      +'<div class="pic"><div class="percent"></div></div>'
      +'<div class="icon-delete J_upload_remove" />'
  +'</li>',
  success: function(e){
      var elem = e.elem;
      var data = e.data;
      loadImageToElem(data.key, elem);
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
  elem.find(".area").append(loading);
  var i = 0;
  setInterval(function(){
    spin.css("background-position","0 " + (i%8) * 40 + "px")
    i++;
  },100);
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
    maxItems: options.max
  });

  var elem = $(selector);
  var result = $("<div class='result'></div>");
  if(options.type == "single"){
    initloading(elem);
    elem.find(".area").append(result);
    uploader.on("progress",function(){
      result.empty();
      elem.find(".text").hide();
      elem.find(".result").hide();
      elem.find(".loading").show();
    }).on("success",function(e){
      loadImageToElem(e.data.key, result, function(){
        elem.find(".loading").hide();
        elem.find(".result").show();
      });
    })
  }

  return uploader;
}
}, {
    entries:entries,
    map:globalMap
});

define(_4, [_20,_22,_21], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var util = require("util");
var events = require("events");

function Autocomplete(input, pattern, parser){
  input = $(input);
  var self = this;
  var list = $("<ul class='autocomplete' />");
  this.list = list;
  input.after(list);
  var delay = 350;
  var timeout = null;
  parser = parser || function(item){return item;}
  input.on("keyup", function(){
    console.log("comming");
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      var value = input.val().trim();
      if(!value){return;}
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
            input.val(item);
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


exports.init = function(input, parser){
  var pattern = input.attr("data-pattern");
  if(!pattern){return;}
  return new Autocomplete(input, pattern, parser);
}
}, {
    entries:entries,
    map:globalMap
});

define(_16, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="addcar" class="container"><h2 class="h2">我的车辆信息</h2><ul class="upload-list"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><div class="row type"><input placeholder="车型" data-pattern="/api/v1/cartypes?q={q}" class="input"/><i class="icon"></i></div><div class="row number"><input placeholder="号牌" class="input number"/><i class="icon"></i></div><div class="row color"><input placeholder="颜色" class="input"/><i class="icon"></i></div><div class="row comment"><input placeholder="备注" class="input"/><i class="icon"></i></div><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();