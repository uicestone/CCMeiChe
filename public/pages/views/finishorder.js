var $ = require("zepto");
var template = require("../tpl/finishorder.html");
var uploader = require("../mod/uploader");
var events = require("events");
var util = require("util");
var tpl = require("tpl");
var viewSwipe = require("view-swipe");
var multiSelect = require("../mod/multiselect");
var popMessage = require("../mod/popmessage");
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


  elem.find(".submit").on("tap", function(){
    self.confirm();
  });

  elem.find(".cancel").on("tap", function(){
    self.emit("cancel");
    viewSwipe.out("bottom");
  });

  multiSelect($("#finishorder"),".breakage");

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

  var breakage = $(".breakages .active").map(function(i,el){
    return $(el).attr("data-index");
  });

  if(breakage){
    data.breakage = breakage;
  }

  if(!data.finish_pics.length){
    return popMessage("请上传车辆照片");
  }

  viewSwipe.out("bottom");
  this.emit("confirm",data);
}

module.exports = new FinishOrder();