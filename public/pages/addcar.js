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

  if(!user.cars.length){
    elem.find(".cancel").hide();
  }

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