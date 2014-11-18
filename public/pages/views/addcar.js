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
      type: elem.find(".type input").val().trim(),
      color: elem.find(".color input").val().trim(),
      number: elem.find(".number input").val().trim(),
      comment: elem.find(".comment input").val().trim()
    };

    var pic = elem.find(".result").attr("data-key");
    if(pic){
      data.pic = pic;
    }

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