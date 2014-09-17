var $ = require('zepto');
// 菜单展开收起
(function(){
  $(".menu").on("click",function(){
    $("body").css("position","fixed");
    $("body").addClass("openmenu");
  });
  $('.overlay').on("click",function(){
    $("body").css("position","static");
    $("body").removeClass("openmenu");
  });
})();