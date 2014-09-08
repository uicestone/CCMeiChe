var $ = require("zepto");
var uploader = require("../mod/uploader");
var autocomplete = require("../mod/autocomplete");
var popMessage = require("../mod/popmessage");
var swipeModal = require("../mod/swipe-modal");

module.exports = swipeModal.create({
  button: $("#go-wash"),
  template:  require("../tpl/addcar.html"),
  show: function(){
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
        input.css("text-align","left");
      }).on("blur",function(){
        if(!input.val()){
          input.attr("placeholder",ph);
          input.css("text-align","right");
        }
      });
    });

    if(!user.cars.length){
      elem.find(".cancel").hide();
    }
  },
  getData: function(){
    var elem = this.elem;
    return {
      pic: elem.find(".result").attr("data-key"),
      type: elem.find(".type input").val(),
      color: elem.find(".color input").val(),
      number: elem.find(".number input").val(),
      comment: elem.find(".comment input").val()
    }
  },
  validate: function(data){
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

    return true
  },
  submit: function(data,callback){
    $.post("/api/v1/mycars",data,"json").done(function(){
      callback(data);
    }).fail(popMessage);
  }
});