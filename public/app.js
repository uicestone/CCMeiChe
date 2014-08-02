var $ = require('zepto');


$(function(){
  var phone = $("#phone");
  var vcode = $("#vcode");
  $("#getvcode").on("click",function(){
    $.get("/api/v1/vcode?phone=" + phone.val())
  });
  $("#go").on("click",function(){
    $.post("/api/v1/signin",{
      phone: phone.val(),
      code: vcode.val()
    });
  });
});
