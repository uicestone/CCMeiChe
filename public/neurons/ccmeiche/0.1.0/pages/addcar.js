(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/myinfos.js";
var _5 = "ccmeiche@0.1.0/pages/myorders.js";
var _6 = "ccmeiche@0.1.0/pages/order.js";
var _7 = "ccmeiche@0.1.0/pages/preorder.js";
var _8 = "ccmeiche@0.1.0/pages/recharge.js";
var _9 = "zepto@^1.1.3";
var _10 = "events@^1.0.5";
var _11 = "util@^1.0.4";
var _12 = "view-swipe@~0.1.4";
var _13 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _14 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _15 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _16 = "uploader@~0.1.4";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_0, [_9,_10,_11,_12,_13,_14,_15], function(require, exports, module, __filename, __dirname) {
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
  uploader.init(".add-photo");

  $(".input").each(function(){
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
      pic: elem.find(".upload-list li").attr("data-key"),
      type: elem.find(".type input").val(),
      color: elem.find(".color input").val(),
      number: elem.find(".number input").val(),
      comment: elem.find(".comment input").val()
    });
  });

  elem.find(".cancel").on("touchend", function(){
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


  $.post("/api/v1/mycars",data).done(function(){
    viewSwipe.out("bottom");
    self.emit("add",data);
  }).fail(function(xhr){
    alert(xhr.responseText);
  });

}

module.exports = new AddCarView();
}, {
    entries:entries,
    map:mix({"./mod/uploader":_13,"./mod/autocomplete":_14,"./tpl/addcar.html":_15},globalMap)
});

define(_13, [_9,_16], function(require, exports, module, __filename, __dirname) {
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
}, {
    entries:entries,
    map:globalMap
});

define(_14, [_9,_11,_10], function(require, exports, module, __filename, __dirname) {
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
  input.on("keyup", function(){
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      var value = input.val();
      if(!value){return;}
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",value)
      }).done(function(data){
        data = parser ? parser(data) : data;
        if(!data.length){return;}
        list.empty();
        data.forEach(function(item){
          var li = $("<li>" + item + "</li>");
          li.on("touchend",function(){
            input.val(item);
            self.emit("select");
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

define(_15, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="addcar" class="container"><h2 class="h2">我的车辆信息</h2><ul class="upload-list"></ul><div class="add-photo"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div><div class="camera"><img src="/img/upload.png"/></div></div><div class="row type"><input placeholder="车型" data-pattern="/api/v1/cartypes?q={q}" class="input"/><i class="icon"></i></div><div class="row number"><input placeholder="号牌" class="input number"/><i class="icon"></i></div><div class="row color"><input placeholder="颜色" class="input"/><i class="icon"></i></div><div class="row comment"><input placeholder="备注" class="input"/><i class="icon"></i></div><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();