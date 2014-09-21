
// 菜单展开收起
(function(){
  $(".menu").on("tap",function(){
    $("body").css("position","fixed");
    $("body").addClass("openmenu");
  });
  $('.overlay').on("tap",function(){
    $("body").css("position","static");
    $("body").removeClass("openmenu");
  });
})();