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
var _29 = "tpl@~0.2.1";
var _30 = "util@^1.0.4";
var _31 = "events@^1.0.5";
var _32 = "uploader-mobile@~0.1.4";
var _33 = "view-swipe@~0.1.4";
var _34 = "hashstate@~0.1.0";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25,_26,_27];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_13, [_28,_29,_24,_3,_8], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var tpl = require("tpl");

var panelAddCar = require("./views/addcar");
var autocomplete = require("./mod/autocomplete");
var carsList = $(".cars ul");
var popMessage = require("./mod/popmessage");

panelAddCar.on("submit",function(data){
  var template = "<div class='text'>"
      +"<p class='title'>@{it.type} @{it.color}</p>"
      +"<p class='desc'>@{it.number}</p>"
    +"</div>"
    +"<div class='edit'>修改</div>";
  var html = tpl.render(template,data);
  var li;
  if("index" in data){
    li = $(".cars li:eq(" + data.index + ")");
    delete data.index;
    li.attr('data-addr',JSON.stringify(data)).html(html);
  }else{
    li = $("<li class='row'/>").attr('data-addr',JSON.stringify(data)).html(html);
    carsList.append(li);
  }
});

var addbtn = $(".addcar");
// 添加车辆
addbtn.on("tap", function(){
  if(addbtn.prop("disabled")){
    return;
  }
  panelAddCar.show();
});

$(".cars").on("tap", ".edit", function(){
  var data = $(this).parent().attr('data');
  data = JSON.parse(data);
  data.index = $(".cars .edit").index(this);
  panelAddCar.show(data);
});

var addaddress = $(".addaddress");
var addressesList = $(".addresses ul");
var addaddressPanel = $(".addaddress-panel");
var ac = autocomplete.init($("#input-address"),function(item){
  return item.name + (item.address ? ("<span class='small'>" + item.address + "</span>") : "");
},function(item){
  return item.name
}).on("select",function(data){
  if(!data || !data.location){
    return;
  }
  $("#input-latlng").val(data.location.lat + "," + data.location.lng);
});

addaddress.on("tap",function(){
  addaddressPanel.appendTo(".section.addresses");
  addaddressPanel.addClass("action-add").removeClass("action-edit");
  addaddress.hide();
  addaddressPanel.show();
  addressesList.find("li .wrap").show();
  addaddressPanel.find(".title").html("添加地址信息");
});

addressesList.on("tap",".edit",function(){
  var li = $(this).closest('li');
  var wrap = li.find(".wrap");
  var wraps = addressesList.find("li .wrap");
  var index = wraps.index(wrap);
  var data = JSON.parse(li.attr("data-addr"));
  wraps.show();
  wrap.hide();
  addaddress.show();
  console.log(index);
  $("#input-index").val(index);
  $("#input-latlng").val(data.latlng && data.latlng.join(","));
  $("#input-address").val(data.address);
  $("#input-carpark").val(data.carpark);
  addaddressPanel.addClass("action-edit").removeClass("action-add");
  addaddressPanel.appendTo(li);
  addaddressPanel.find(".title").html("修改地址信息");
  addaddressPanel.show();
});

$("#remove-address").on("tap", function(){
  var row = $(this).closest("li");
  var index = $("#input-index").val();  

  addaddressPanel.appendTo(".section.addresses");
  row.remove();

  addaddressPanel.hide();

  $.ajax({
    url: "/api/v1/myaddresses/" + index,
    type: "DELETE",
    success: function(){
      console.log(arguments);
    }
  });

});

$("#save-address").on("tap",function(){
  var index = $("#input-index").val();
  var data = {
    latlng: $("#input-latlng").val().split(","),
    address: $("#input-address").val(),
    carpark: $("#input-carpark").val()
  };
  var type = "add";

  if(index!==""){
    type = "edit";
  }

  if(!data.address){
    return popMessage("请输入地址");
  }

  if(!data.carpark){
    return popMessage("请输入车位");
  }

  if(!data.latlng){
    return popMessage("无法定位该地址");
  }

  var url = (type == "edit") ? ("/api/v1/myaddresses/" + index) : "/api/v1/myaddresses";

  $.post(url, data, "json")
  .done(function(){

    if(type == "add"){
      var template = "<div class='wrap'><div class='text'>"
        +"<p class='title'>@{it.address}</p>"
        +"<p class='desc'>@{it.carpark}</p>"
      +"</div>"
      +"<div class='edit'>修改</div></div>";
      var html = tpl.render(template,data);
      li = $("<li class='row'/>").attr('data-addr',JSON.stringify(data)).html(html);
      addressesList.append(li);
    }else{
      var li = $(".addresses .row").eq(index);
      li.attr("data-addr", JSON.stringify(data));
      li.find(".title").text(data.address);
      li.find(".desc").text(data.carpark);
    }

    $(".addresses .wrap").show();
    $("#input-latlng").val('');
    $("#input-address").val('');
    $("#input-carpark").val('');
    addaddressPanel.hide();
    addaddress.show();
  })
  .fail(popMessage);
});
}, {
    entries:entries,
    map:mix({"./views/addcar":_24,"./mod/autocomplete":_3,"./mod/popmessage":_8},globalMap)
});

define(_24, [_28,_12,_3,_8,_11,_5,_19], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var uploader = require("../mod/uploader");
var autocomplete = require("../mod/autocomplete");
var popMessage = require("../mod/popmessage");
var swipeModal = require("../mod/swipe-modal");
var inputClear = require("../mod/input-clear");

module.exports = swipeModal.create({
  button: $(".addcar"),
  template:  require("../tpl/addcar.html"),
  show: function(data){
    var elem = this.elem;

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
      }).on("blur",function(){
        if(!input.val()){
          input.attr("placeholder",ph);
        }
      });
    });

    if(!user.cars.length){
      elem.find(".cancel").hide();
      elem.find(".submit").css('float','none');
    }

    inputClear(elem.find(".type"));
    inputClear(elem.find(".number"));
    inputClear(elem.find(".color"));
    inputClear(elem.find(".comment"));

    if(data){
      if(data.pic){
        var img = $("<img />").attr('src',
          appConfig.qiniu_host
          + data.pic
          + "?imageView/1/w/155/h/105"
        );
        var result_elem = elem.find(".result");
        elem.find(".text").hide();
        result_elem.attr("data-key", data.pic);
        result_elem.empty().append(img);
      }

      elem.find(".type .input").val(data.type||"");
      elem.find(".number .input").val(data.number||"");
      elem.find(".color .input").val(data.color||"");
      elem.find(".comment .input").val(data.comment||"");
      elem.data("index",data.index);
    }
  },
  getData: function(){
    var elem = this.elem;
    var index = elem.data("index");
    var data = {
      pic: elem.find(".result").attr("data-key"),
      type: elem.find(".type input").val(),
      color: elem.find(".color input").val(),
      number: elem.find(".number input").val(),
      comment: elem.find(".comment input").val()
    };
    if(index !== undefined){
      data.index = index;
    }
    return data;
  },
  validate: function(data){
    if(!data.type){
      popMessage("请填写车型");
      return;
    }
    if(!data.number){
      popMessage("请填写车号");
      return;
    }
    if(!data.color){
      popMessage("请填写颜色");
      return;
    }

    // if(!/^[\u4e00-\u9fa5]{1}[A-Z0-9]{6}$/.test(data.number)){
    //   popMessage("车号格式无效");
    //   return;
    // }

    return true
  },
  submit: function(data,callback){
    $.post("/api/v1/mycars",data,"json").done(function(){
      callback(data);
    }).fail(popMessage);
  }
});
}, {
    entries:entries,
    map:mix({"../mod/uploader":_12,"../mod/autocomplete":_3,"../mod/popmessage":_8,"../mod/swipe-modal":_11,"../mod/input-clear":_5,"../tpl/addcar.html":_19},globalMap)
});

define(_3, [_28,_30,_31], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var util = require("util");
var events = require("events");

function Autocomplete(input, pattern, parser, getVal){
  input = $(input);
  var self = this;
  var list = $("<ul class='autocomplete' />");
  this.list = list;
  input.after(list);
  var delay = 350;
  parser = parser || function(item){return item;}
  getVal = getVal || function(item){return item;}
  var needRequest = function(value){
    return value.match(/\w{1,}/) || value.match(/[\u4e00-\u9fa5]{1,}/);
  }

  function Watcher(options){
    var interval = this.interval = options.interval;
    var getter = this.getter = options.getter;
    var oldValue = this.oldValue = getter();
  }

  util.inherits(Watcher,events);
  Watcher.prototype.start = function(){
    this.stop();
    var self = this;
    self.itv = setInterval(function(){
      var v = self.getter();
      if(v !== self.oldValue){
        self.emit("change",v,self.oldValue);
      }
      self.oldValue = v;
    },self.interval);
  };
  Watcher.prototype.stop = function(){
    var self = this;
    clearInterval(this.itv);
  };

  var watcher = this.watcher = new Watcher({
    interval: 100,
    getter: function(){
      return input.val().trim();
    }
  });

  input.on("focus",function(){
    watcher.start();
  });

  watcher.on('change', function(v){
      if(!needRequest(v)){return;}
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",encodeURIComponent(v))
      }).done(function(data){
        if(!data.length){return;}
        list.empty();
        data.map(parser).forEach(function(item,i){
          var li = $("<li>" + item + "</li>");
          li.on("tap",function(){
            input.val(getVal(data[i]));
            self.emit("select",data[i]);
            watcher.stop();
            self.hide();
          });
          $(list).append(li);
        });
        var packup = $("<li class='packup'>收起</li>");
        packup.on("tap",function(){
          self.hide();
        });
        list.append(packup);
        self.show();
      }).fail(function(){
        console.log("failed");
      });
  });
}

util.inherits(Autocomplete, events);

Autocomplete.prototype.show = function(){
  this.list.show();
}

Autocomplete.prototype.stopWatch = function(){
  this.watcher.stop();
}

Autocomplete.prototype.hide = function(){
  this.list.hide();
}


exports.init = function(input, parser, getVal){
  var pattern = input.attr("data-pattern");
  if(!pattern){return;}
  return new Autocomplete(input, pattern, parser, getVal);
}
}, {
    entries:entries,
    map:globalMap
});

define(_8, [_28], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
function popMessage(message, styles){
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
  });
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

define(_12, [_28,_32], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var Uploader = require('uploader-mobile');

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
    maxItems: type == "single" ? -1 : options.maxItems
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

define(_11, [_30,_31,_33,_29,_34,_28], function(require, exports, module, __filename, __dirname) {
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
    $("body>.container,body>.wrap").css("display","block");
    $("body").css("position","fixed");
    $(".swipe-container").css("position","fixed");
    setTimeout(function(){
      $("body").css("position","");
    },300);

    viewSwipe.out("bottom");
    button.prop("disabled",false);
  }

  function viewCome(){
    var elem = self.elem;
    setTimeout(function(){
      $("body>.container,body>.wrap").css("display","none");
      $(".swipe-container").css("position","relative");
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
  elem.find(".submit").on("tap",function(){
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

  elem.find(".cancel").on("tap", function(){
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

define(_5, [_28], function(require, exports, module, __filename, __dirname) {
$ = require('zepto');

function inputClear(wrap){
  var input = wrap.find(".input");
  var clear = $('<div class="clear" />');
  wrap.addClass('clear-input-wrap');
  clear.appendTo(wrap);
  clear.hide();

  input.on('focus', function(){
    if(input.val()){
      clear.show();
    }
  });
  input.on('keyup', function(){
    if(input.val()){
      clear.show();
    }else{
      clear.hide();
    }
  });
  clear.on('tap', function(e){
    e.preventDefault();
    input.val("");
    clear.hide();
  });
  input.on('blur', function(){
    clear.hide();
  });
}

module.exports = inputClear;
}, {
    entries:entries,
    map:globalMap
});

define(_19, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="addcar" class="container"><h2 class="h2">我的车辆信息</h2><ul class="upload-list"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><div class="row type"><input placeholder="车型" data-pattern="/api/v1/cartypes/{q}" class="input"/><i class="icon"></i></div><div class="row number"><input placeholder="号牌" class="input"/><i class="icon"></i></div><div class="row color"><input placeholder="颜色" class="input"/><i class="icon"></i></div><div class="row comment"><input placeholder="备注" class="input"/><i class="icon"></i></div><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();