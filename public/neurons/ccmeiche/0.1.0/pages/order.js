(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/month_package.js";
var _4 = "ccmeiche@0.1.0/pages/myinfos.js";
var _5 = "ccmeiche@0.1.0/pages/myorders.js";
var _6 = "ccmeiche@0.1.0/pages/order-result.js";
var _7 = "ccmeiche@0.1.0/pages/order.js";
var _8 = "ccmeiche@0.1.0/pages/promos.js";
var _9 = "ccmeiche@0.1.0/pages/recharge.js";
var _10 = "zepto@^1.1.3";
var _11 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _12 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _13 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _14 = "events@^1.0.5";
var _15 = "util@^1.0.4";
var _16 = "tpl@~0.2.1";
var _17 = "view-swipe@~0.1.4";
var _18 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _19 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _20 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _21 = "uploader-mobile@~0.1.5";
var _22 = "ccmeiche@0.1.0/pages/mod/wechat-uploader.js";
var _23 = "attributes@^1.4.1";
var _24 = "underscore@^1.6.0";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_7, [_10,_11,_12,_13], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var popMessage = require('./mod/popmessage');
var finishPanel = require('./views/finishorder');
require("./mod/countdown");

var button = $(".button");
var posting = false;

finishPanel.on("confirm",function(data){
  posting = true;
  $("#order").css("position","static");
  $.post("/api/v1/orders/" + order._id + "/done",data,"json").done(function(){
    location.reload();
  }).fail(function(xhr){
    posting = false;
    popMessage(xhr);
  });
}).on("cancel",function(){
  $("#order").css("position","static");
});
button.on("click",function(e){
  if(posting){return;}
  if(button.hasClass("arrive")){
    posting = true;
    $.post("/api/v1/orders/" + order._id + "/arrive").done(function(){
      posting = false;
      button.html("完成");
      button.removeClass("arrive").addClass("done");
    });
  }else if(button.hasClass("done")){
    $("#order").css("position","fixed");
    finishPanel.show({
      cars: order.cars
    });
  }
});
}, {
    entries:entries,
    map:mix({"./mod/popmessage":_11,"./views/finishorder":_12,"./mod/countdown":_13},globalMap)
});

define(_11, [_10], function(require, exports, module, __filename, __dirname) {
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

define(_12, [_10,_14,_15,_16,_17,_18,_19,_20,_11], function(require, exports, module, __filename, __dirname) {
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

function FinishOrder(){}

util.inherits(FinishOrder,events);

FinishOrder.prototype.show = function(data){
  console.log(data);
  var html = tpl.render(template,data);
  var elem = $(html);
  var self = this;
  viewSwipe.in(elem[0],"bottom");

  $(".user-photos").each(function(i,el){
    var $el = $(el);

    uploader.init( $el.find(".add-photo"),{
      type:"multiple",
      prefix:"carwash/",
      queueTarget:$el.find(".finish_photos"),
      maxItems: 3
    }).on("add",function(){
      uploading = true;
    }).on("complete",function(){
      uploading = false;
    }).on("error", function(){
      uploading = false;
    });
  });

  uploader.init(".breakage-upload .add-photo",{
    type:"multiple",
    prefix:"carbreak/",
    queueTarget:$(".breakage_photos")
  }).on("add",function(){
    uploading = true;
  }).on("complete",function(){
    uploading = false;
  }).on("error", function(){
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
    finish_pics: $(".finish_photos").get().map(function(e,i){
      return $(e).find("li").get().map(function(e){
        return $(e).attr("data-key")
      });
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

  if(data.finish_pics.some(function(item){
    return !item.length;
  })){
    return popMessage("请上传车辆照片");
  }

  viewSwipe.out("bottom");
  this.emit("confirm",data);
}

module.exports = new FinishOrder();
}, {
    entries:entries,
    map:mix({"../tpl/finishorder.html":_18,"../mod/uploader":_19,"../mod/multiselect":_20,"../mod/popmessage":_11},globalMap)
});

define(_13, [_10], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function addZero(num){
  if(Math.abs(num) < 10){
    return "0" + num;
  }else{
    return num;
  }
}

function calculateTime(){
  $(".time").forEach(function(elem,i){
    var el = $(elem);
    var finish_time = new Date(el.attr("data-finish"));

    if(appConfig.service == "worker"){
      finish_time = new Date( +finish_time - 15 * 60 * 1000 );
    }

    var now = new Date();
    var duration = finish_time - now;
    var negative = now > finish_time ? "-" : "";
    var minutes =  Math.floor( Math.abs( duration / (1000 * 60)));
    var seconds = Math.round( (Math.abs(duration) - minutes * 1000 * 60) / 1000);
    el.html( negative + addZero(minutes) + ":" + addZero(seconds) );
  });
}


setInterval(calculateTime,1000);
calculateTime();
}, {
    entries:entries,
    map:globalMap
});

define(_18, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="finishorder" class="container"><h2 class="h2">洗车已完成</h2><?js it.cars.forEach(function(car){ ?><div class="user-photos"><h3>@{car.type + \' \' + car.number}</h3><ul class="photo-list finish_photos"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片<br/>(非必须)</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div></div><?js }); ?><h2 class="h2">车损部位</h2><ul class="breakages"><li data-index="1" class="breakage breakage-1"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M29.306,80.6V50.958h1.982l-0.548-5.383l6.026-6.459h-7.792v-5.715h11.561v1.347l9.671-11.833c16.335,0,32.673,0,49.011,0l10.245,12.542v-2.058h11.568v5.715h-8.375l6.03,6.459l-0.55,5.37l2.134,0.013v29.641H104.16v-5.409H45.418v5.409L29.306,80.6L29.306,80.6z M37.146,48.827l1.829,8.463h18.979l-0.61-2.976L37.146,48.827L37.146,48.827zM47.559,62.242l1.641,6.901c12.332,0,37.396,0,49.729,0l1.641-6.901H47.559L47.559,62.242z M112.415,48.827l-20.2,5.486l-0.609,2.976h18.979L112.415,48.827L112.415,48.827z M45.804,37.233c18.944-0.149,39.039-0.149,57.812,0l-7.468-9.771c-14.294,0-28.584,0-42.875,0L45.804,37.233z"/></svg></li><li data-index="2" class="breakage breakage-2"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M30.307,81.6V51.958h1.982l-0.549-5.383l6.026-6.46h-7.791v-5.717h11.563v1.347l9.671-11.831c16.336,0,32.674,0,49.011,0l10.246,12.542v-2.06h11.567v5.717h-8.374l6.03,6.46l-0.55,5.37l2.134,0.013v29.641h-16.109v-5.409H46.419v5.409L30.307,81.6L30.307,81.6z M46.804,38.233c18.945-0.152,39.039-0.152,57.813,0l-7.468-9.771c-14.294,0-28.584,0-42.875,0L46.804,38.233z"/></svg></li><li data-index="3" class="breakage breakage-3"><svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M70.582,65.656c-1.173-8.277-1.089-16.553-0.09-24.83l-15.709-5.549c-1.942,12.33-2.133,24.349,0.01,35.957L70.582,65.656L70.582,65.656zM66.736,29.382c17.903,0,36.034,0,53.414,0c2.512,15.574,2.495,31.152,0,46.731c-17.82,0-35.639,0-53.458,0l19.604,10.315c-1.199,2.382-3.254,3.652-7.167,2.491L54.337,76.112c-6.71,0-13.419,0-20.131,0c-5.878-16.209-5.408-31.738,0-46.731c6.873,0,13.75,0,20.623,0l24.303-12.782c3.912-1.161,5.967,0.11,7.166,2.493L66.736,29.382L66.736,29.382z M90.863,36.902H74.137l-8.775-3.098h34.278L90.863,36.902L90.863,36.902z M107.31,36.303l-9.066,3.205v26.784l9.066,3.205V36.303L107.31,36.303zM98.439,71.568H68.594l8.821-3.115h12.203L98.439,71.568z"/></svg></li><li data-index="4" class="breakage breakage-4"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M34.355,88.598V61.458h1.813l-0.502-4.929l7.07-7.583l0.878-1.076L38,33.333l-0.494-1.282l0.584-1.245l5.677-12.035l0.871-1.851h2.03h13.776h30.263h13.917h2.05l0.862,1.873l5.539,12.042l0.564,1.225l2.551,24.469l-0.499,4.911l1.953,0.019v27.141h-14.753v-4.957H49.108v4.957L34.355,88.598L34.355,88.598zM111.82,36.775l-4.059,10.506l1.358,1.664l3.127,3.351L111.82,36.775L111.82,36.775z M51.242,26.575l-2.059,5.177h53.128l-2.056-5.177H51.242L51.242,26.575z M84.838,55.734l-0.31-1.753h-2.139l-0.208-1.549H67.145l-0.207,1.549h-2.332l-0.288,1.753h2.332l-0.257,1.908h-2.389l-0.292,1.779h21.783l-0.318-1.779h-2.244l-0.256-1.908H84.838L84.838,55.734z M50.55,54.51L52,52.433h-4.525h-0.541h-0.293l-2.635,3.128l15.03,2.994l0.862-2.722L50.55,54.51L50.55,54.51z M90.721,59.022l17.928-3.462l-3.383-3.128h-1.049h-0.538h-5.804l1.452,2.075l-9.686,1.368L90.721,59.022L90.721,59.022z M49.762,46.002h51.628l5.297-13.71l-4.113-8.937H90.708H60.444H48.693l-4.217,8.953L49.762,46.002L49.762,46.002z M41.531,59.506l1.677,7.745h17.375l-0.555-2.722L41.531,59.506L41.531,59.506z M51.067,71.786l1.503,6.319c11.293,0,34.245,0,45.538,0l1.5-6.319H51.067L51.067,71.786z M110.451,59.506l-18.496,5.023l-0.557,2.722h17.381L110.451,59.506z"/></svg></li><li data-index="5" class="breakage breakage-5"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M54.216,44.177h48.643V24.984H82.504L54.216,44.177L54.216,44.177z M84.763,50.842h17.681v2.971v2.537h-12.28l-5.4-2.781V50.842L84.763,50.842z M111.204,88.598h-66.47l-4.153-19.547V44.274l38.072-26.579l1.137-0.775h1.355h25.993h4.28C111.419,40.811,111.204,64.704,111.204,88.598z"/></svg></li><li data-index="6" class="breakage breakage-6"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M103.79,81.086c-9.884-1.356-18.815-2.038-27.789-2.038c-8.975,0-17.907,0.682-27.789,2.038l-4.316-2.749L29.974,34.748l2.928-5.085c15.532-3.484,29.321-5.229,43.1-5.229c13.773,0,27.566,1.745,43.098,5.229l2.931,5.085l-13.923,43.589L103.79,81.086L103.79,81.086z M64.556,71.42c3.869-0.239,7.658-0.361,11.444-0.361c8.238,0,16.517,0.565,25.545,1.701l11.579-36.25c-4.201-0.871-8.279-1.597-12.269-2.19l-2.395,3.977l0.28,2.92l-2.728,0.661l1.6,3.578l-6.021-0.377l-0.94,6.592l-1.599-7.909l4.891-0.712l-1.691-2.819l2.634-0.564l-1.223-2.782v-3.489C87.682,32.748,81.844,32.42,76,32.42c-11.98,0-23.949,1.364-37.124,4.091l11.576,36.25c2.169-0.273,4.294-0.516,6.387-0.722l1.886-4.558l-4.958-3.379l1.052-4.118l-3.377-2.853l4.011-10.879l-0.741,9.61l4.961,1.586l-1.477,5.068l7.594,5.812L64.556,71.42z"/></svg></li><li data-index="7" class="breakage breakage-7"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M61.025,73.013l7.541-13.551c-0.761-0.897-1.375-1.929-1.79-3.05h-15.5c0.767,5.558,3.352,10.535,7.125,14.321C59.218,71.55,60.097,72.315,61.025,73.013L61.025,73.013z M76.002,16.921c9.89,0,18.837,4.012,25.316,10.494c6.476,6.484,10.482,15.446,10.482,25.345c0,9.894-4.007,18.855-10.482,25.338c-6.479,6.491-15.427,10.501-25.316,10.501c-9.884,0-18.835-4.019-25.31-10.501c-6.48-6.482-10.49-15.444-10.49-25.338c0-9.899,4.01-18.861,10.49-25.345C57.167,20.933,66.118,16.921,76.002,16.921L76.002,16.921z M96.141,32.599c5.148,5.162,8.337,12.287,8.337,20.16c0,7.868-3.188,14.998-8.337,20.155c-5.157,5.162-12.274,8.354-20.139,8.354c-7.86,0-14.985-3.191-20.134-8.354c-5.156-5.155-8.345-12.287-8.345-20.155c0-7.874,3.189-14.999,8.345-20.16c5.149-5.154,12.274-8.347,20.134-8.347C83.866,24.252,90.988,27.445,96.141,32.599L96.141,32.599z M87.595,75.372c-6.333,3.227-13.879,3.608-20.496,1.039l7.547-13.559c0.5,0.077,1.015,0.12,1.541,0.12c0.877,0,1.725-0.113,2.535-0.324L87.595,75.372L87.595,75.372z M70.034,50.805c-0.904-0.022-1.651,0.691-1.673,1.602c-0.017,0.904,0.699,1.652,1.601,1.674c0.903,0.015,1.655-0.699,1.672-1.604C71.656,51.574,70.94,50.826,70.034,50.805L70.034,50.805z M72.277,57.767c-0.303,0.854,0.145,1.793,0.996,2.096c0.853,0.297,1.792-0.147,2.09-0.994c0.303-0.854-0.145-1.794-0.992-2.098C73.517,56.468,72.579,56.91,72.277,57.767L72.277,57.767z M79.902,57.59c-0.744-0.508-0.938-1.532-0.43-2.28c0.508-0.749,1.53-0.938,2.277-0.431c0.746,0.508,0.938,1.531,0.432,2.273C81.67,57.901,80.65,58.1,79.902,57.59L79.902,57.59zM81.996,51.08c-0.769,0.48-1.777,0.245-2.259-0.517c-0.479-0.77-0.244-1.778,0.522-2.259c0.766-0.481,1.777-0.248,2.259,0.522C82.995,49.59,82.766,50.605,81.996,51.08L81.996,51.08z M76.466,46.496c-0.193-0.882-1.064-1.441-1.945-1.25c-0.883,0.192-1.446,1.067-1.257,1.95c0.192,0.881,1.066,1.44,1.947,1.25C76.094,48.253,76.656,47.387,76.466,46.496L76.466,46.496zM101.099,56.41c-0.77,5.559-3.35,10.536-7.128,14.322c-0.222,0.218-0.443,0.437-0.673,0.649l-8.874-12.72c0.486-0.699,0.881-1.445,1.178-2.252H101.099L101.099,56.41z M91.351,32.839c0.923,0.7,1.802,1.463,2.62,2.289c3.778,3.777,6.358,8.757,7.128,14.319H85.602c-0.417-1.13-1.03-2.159-1.792-3.056L91.351,32.839L91.351,32.839z M64.778,30.481c3.425-1.745,7.302-2.733,11.41-2.733c3.207,0,6.267,0.601,9.089,1.693L77.73,42.999c-0.502-0.078-1.018-0.118-1.542-0.118c-0.879,0-1.726,0.113-2.536,0.324L64.778,30.481L64.778,30.481z M51.276,49.447h15.499c0.297-0.804,0.69-1.559,1.172-2.251l-8.867-12.718c-0.235,0.21-0.456,0.423-0.677,0.65C54.628,38.905,52.044,43.885,51.276,49.447z"/></svg></li><li data-index="8" class="breakage breakage-8"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M98.371,22.648c1.392,1.641,2.654,3.652,3.746,5.965c2.927,6.188,4.741,14.668,4.741,23.978c0,9.307-1.813,17.784-4.741,23.974c-1.229,2.597-2.664,4.806-4.259,6.544c-4.413,4.806-11.321,4.9-17.323,5.283c-4.368,0.277-8.759,0.304-13.117-0.089c-3.185-0.29-8.209-1.033-10.847-2.876c-6.651-4.659-11.43-17.495-11.43-32.607c0-13.486,3.801-25.159,9.349-30.823c3.478-3.561,8.35-4.238,13.039-4.67c4.667-0.433,9.205-0.509,13.641-0.284C87.475,17.372,93.977,17.471,98.371,22.648L98.371,22.648z M90.881,24.901c1.506,0,2.881,0.64,4.099,1.813l-0.104-0.534c-1.74-2.055-3.675-3.222-5.674-3.222c-3.238,0-6.312,3.068-8.656,8.016c-2.589,5.479-4.195,13.117-4.195,21.616c0,8.497,1.605,16.134,4.195,21.612c2.344,4.952,5.418,8.014,8.656,8.014c2.692,0,5.264-2.111,7.398-5.658l0.104-1.121c-1.581,2.559-3.559,4.014-5.824,4.014c-3.591,0-6.448-3.646-8.169-9.546c-1.345-4.614-2.176-10.89-2.176-17.729c0-6.839,0.831-13.116,2.176-17.729C84.432,28.546,87.29,24.901,90.881,24.901L90.881,24.901z M93.915,36.81c-0.753-2.577-1.304-4.161-1.484-4.161c-0.182,0-0.733,1.585-1.485,4.161c-1.124,3.853-1.818,9.281-1.818,15.366c0,6.086,0.695,11.514,1.818,15.367c0.752,2.571,1.304,4.161,1.485,4.161c0.181,0,0.731-1.591,1.484-4.161c1.12-3.854,1.818-9.281,1.818-15.367C95.733,46.091,95.035,40.661,93.915,36.81L93.915,36.81z M66.636,30.215c-0.758,1.781-1.404,3.662-1.939,5.614l8.666-0.066c0.519-2.026,1.142-4.006,1.875-5.904L66.636,30.215L66.636,30.215z M59.476,24.928c-1.184,1.339-2.233,2.842-3.151,4.471l6.846,0.022c0.794-1.711,1.701-3.318,2.719-4.815L59.476,24.928L59.476,24.928z M72.935,20.532c-0.118,0.114-0.231,0.23-0.343,0.35c-1.365,1.416-2.58,3.029-3.652,4.795l8.15,0.022c1.014-1.989,2.179-3.855,3.483-5.55L72.935,20.532L72.935,20.532z M58.745,82.299l7.09,0.623c-1.017-1.761-1.934-3.68-2.753-5.73l-7.307-0.409C56.654,78.812,57.648,80.665,58.745,82.299L58.745,82.299zM69.706,79.688l8.296,0.736c-1.098-1.881-2.07-3.969-2.905-6.227l-8.591-0.477C67.424,75.958,68.493,77.969,69.706,79.688L69.706,79.688z M53.939,71.797l7.509,0.662c-0.546-1.832-1.016-3.73-1.412-5.664l-7.484-0.416C52.939,68.243,53.405,70.059,53.939,71.797L53.939,71.797z M64.927,69.141l8.796,0.781c-0.544-1.968-0.993-4.024-1.347-6.135l-8.776-0.485C63.949,65.323,64.393,67.281,64.927,69.141L64.927,69.141z M46.884,60.738h0.039l-0.005-0.05L46.884,60.738L46.884,60.738z M51.214,55.63l0.012,0.203c0.082,1.716,0.226,3.428,0.431,5.116l7.49,0.333c-0.216-1.761-0.37-3.537-0.45-5.318l-0.012-0.246L51.214,55.63L51.214,55.63z M62.645,52.018l-0.005,0.06c0.005,1.902,0.087,3.8,0.245,5.664l8.781,0.394c-0.169-1.956-0.256-3.941-0.256-5.932v-0.082L62.645,52.018L62.645,52.018z M51.593,44.987c-0.21,1.744-0.346,3.525-0.411,5.313l7.459,0.208c0.051-1.865,0.18-3.724,0.388-5.561L51.593,44.987L51.593,44.987z M63.523,41.171c-0.315,1.874-0.544,3.788-0.692,5.712l8.748,0.245c0.143-2.017,0.366-4.023,0.682-6.003L63.523,41.171L63.523,41.171zM54.021,34.478c-0.601,1.657-1.103,3.395-1.512,5.194l7.368-0.047c0.382-1.872,0.857-3.691,1.429-5.447L54.021,34.478z"/></svg></li><li data-index="9" class="breakage breakage-9"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><g><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M59.881,36.714l-0.75,0.142l-9.543,2.109c-0.415,0.1-0.83,0.21-1.241,0.312l-0.012,0.008c-4.854,1.274-4.587,2.667-9.079,4.428l-6.483,17.079l-4.308,0.606l2.536,16.946l20.167,0.069c0.753,1.029,1.587,2.004,2.488,2.907c4.493,4.497,10.7,7.28,17.558,7.28c6.854,0,13.064-2.784,17.558-7.28c0.909-0.911,1.749-1.894,2.509-2.937l32.251-0.032V31.778l-6.32,0.07c2.308-1.376,4.362-2.626,6.32-3.82V16.922L99.01,31.086c-2.229,0.862-5.625,1.326-5.625,1.326C80.723,33.57,69.766,34.85,59.881,36.714L59.881,36.714z"/><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M93.726,58.019l7.274,3.78l0.066,2.407H88.785v0.263c0,9.511-7.703,17.23-17.21,17.23c-9.502,0-17.215-7.72-17.215-17.23c0-0.453,0.022-0.874,0.057-1.313h-3.485c0.881-10.454,9.645-18.683,20.324-18.683C81.197,44.471,87.838,49.137,93.726,58.019L93.726,58.019z"/><ellipse fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" cx="71.468" cy="64.024" rx="12.106" ry="12.119"/></g></svg></li><li data-index="10" class="breakage breakage-10"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="44px" height="32px" viewBox="0 0 150 106"><path fill="none" stroke="#fab44a" stroke-width="3" stroke-miterlimit="10" d="M67.385,25.456l11.553-3.033v-0.419l4.325,0.012c10.415,0.032,19.896,3.26,26.794,8.465c7.396,5.582,11.973,13.446,11.973,22.279c0,8.834-4.577,16.702-11.973,22.279c-6.897,5.206-16.38,8.439-26.794,8.466l-4.325,0.013V83.09l-11.553-3.408V25.456L67.385,25.456z M60.135,68.46v6.429H29.973V68.46H60.135L60.135,68.46z M60.135,56.431v6.429H29.973v-6.429H60.135L60.135,56.431z M60.135,44.064v6.428H29.973v-6.428H60.135L60.135,44.064z M60.135,31.471V37.9H29.973v-6.429H60.135L60.135,31.471z M105.192,38.375c-4.613-3.478-10.733-5.865-17.604-6.592v41.954c6.871-0.721,12.991-3.108,17.604-6.586c5.063-3.816,8.192-8.916,8.192-14.392S110.256,42.19,105.192,38.375z"/></svg></li></ul><ul class="photo-list breakage_photos"></ul><div class="breakage-upload"><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片<br/>(非必须)</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div></div><input type="button" value="完成" class="button submit"/><input type="button" value="取消" class="button cancel"/></div>'
}, {
    entries:entries,
    map:globalMap
});

define(_19, [_10,_21,_11,_22], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var Uploader = require('uploader-mobile');
var popMessage = require('./popmessage');

Uploader.addAdapter("wechat", require('./wechat-uploader'));

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
    type: navigator.userAgent.match("MicroMessenger") ? "wechat" : "ajax",
    theme: type == "single" ? null : uploadTemplate,
    beforeUpload: beforeUpload(options.prefix || ""),
    allowExtensions: ["png","jpg"],
    maxSize: "500K",
    maxItems: type == "single" ? 1 : options.maxItems
  }).on("select",function(e){
    window.log("选择文件", e.files.map(function(file){
      return file.name + " " + Math.round(file.size / 1024) + "KB";
    }).join(","),'');
  }).on("error", function(e){
    if(type == "single"){
      elem.find(".loading").hide();
      elem.find(".text").show();
    }
    window.onerror(e);
    popMessage("上传失败，请重试");
    e.elem.remove();
    window.onerror("上传失败",JSON.stringify({code:e.code,message:e.message}),'');
  }).on("success", function(e){
    console.log(e);
    window.log("上传成功", appConfig.qiniu_host + e.data.key,'');
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
        width: 205,
        height: 105
      }, function(){
        elem.find(".loading").hide();
        elem.find(".result").show();
      });
      if(type == "single"){
        uploader.get("queue").clear();
        uploader.get("adapter").files = [];
      }
      uploader.emit("enable");
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
    map:mix({"./popmessage":_11,"./wechat-uploader":_22},globalMap)
});

define(_20, [_10], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");

function MultiSelect(container,itemSelector){
  container = $(container);
  var items = this.items = container.find(itemSelector);
  items.each(function(i,item){
    $(item).on("tap",function(){
      $(this).toggleClass("active");
    })
  });
  return this;
}

MultiSelect.prototype.select = function(dataList){
  var items = this.items;
  var jsonList = dataList.map(function(data){return JSON.stringify(data);});
  dataList.forEach(function(data){
    items.filter(function(i){
      return JSON.stringify($(this).data("data")) == JSON.stringify(data);
    }).addClass("active");
  });
};


module.exports = function(container,itemSelector){
  return new MultiSelect(container,itemSelector);
}
}, {
    entries:entries,
    map:globalMap
});

define(_22, [_10,_15,_14,_23,_24], function(require, exports, module, __filename, __dirname) {
var $ = require('zepto');
var util = require('util');
var events = require('events');
var attributes = require('attributes');
var _ = require('underscore');
var uuid = 0;
module.exports = WechatUploader;

function WechatLocalFile(localId){
  this.localId = localId;
  this.name = "untitled.jpg";
  this.id = -1;
}

/**
 * @name WechatUploader
 * @class 微信方案上传
 * @constructor
 * @requires UploadType
 */
function WechatUploader(elem, config) {
  elem = $(elem);
  var self = this;

  this.files = [];
  this.set('config', config);
  elem.on('click',function(){
    if(self.get("isDisabled")){
      return false;
    }else{
      self._choose();
    }
  });
  self.on("_wxchoose", function(localIds){
    for (var i = 0; i < localIds.length; i++) {
      var file = new WechatLocalFile(localIds[i]);;
      file.id = uuid++;
      self.files.push(file);
    }

    self.emit('select', {
      files: self.files
    });
  });

  self.on("success", function(){
    self.files.shift();
  });

  wx.ready(function(){
    self.emit('load');
  });
}

util.inherits(WechatUploader, events);

WechatUploader.prototype._choose = function(){
  var self = this;
  wx.chooseImage({
    success: function (res) {
      var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      self.emit("_wxchoose", localIds);
    },
    fail: function(res){
      self.emit('error',JSON.stringify(res))
    }
  });
}

WechatUploader.prototype.setDisabled = function(isDisabled){
  this.set("isDisabled",isDisabled);
};

WechatUploader.prototype.setFileTypes = function(extensions) {};

WechatUploader.prototype.transfer = function(file){
  var self = this;
  var serverId = file.serverId;
  $.ajax({
    url:"/api/v1/transfer-image",
    type:"post",
    data:{
      serverId: serverId
    },
    success: function(data){
      self.emit("success", {
        file: file,
        data: data
      });
    },
    fail: function(data){
      self.emit("error", "transfer fail");
    }
  });
}

WechatUploader.prototype.upload = function (file) {
  var self = this;
  var file = _.filter(this.files,function(file){
    return file.status == "waiting";
  })[0];

  var config = this.get('config');
  var data = this.get('data');
  var self = this;

  wx.uploadImage({
    localId: file.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
    isShowProgressTips: 0, // 默认为1，显示进度提示
    success: function (res) {
      file.serverId = res.serverId; // 返回图片的服务器端ID
      self.transfer(file);
    },
    fail: function(res){
      self.emit('error', {
        file:file,
        message: JSON.stringify(res)
      });
    }
  });
};

WechatUploader.prototype.setData = function (data) {
  this.set('data', data);
};

attributes.patch(WechatUploader, {
  config: {
    value: {}
  },
  data: {
    value: {}
  },
  isDisabled:{
    value: false
  }
});
}, {
    entries:entries,
    map:globalMap
});
})();