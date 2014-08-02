var $ = require('zepto');

$(function(){
  var ipt_phone = $("#phone");
  var ipt_vcode = $("#vcode");
  var btn_send_code = $("#getvcode");
  var btn_signin = $("#go");
  var interval = null;
  var count = 30;

  function numValid(){
    return ipt_phone.val().match(/^1(\d){10}$/);
  }

  function vcodeValid(){
    return ipt_vcode.val().match(/^(\d){4}$/);
  }

  ipt_phone.on("keyup",function(){
    btn_send_code.prop("disabled",!numValid());
  });

  ipt_vcode.on("keyup",function(){
    var valid = vcodeValid() && numValid() && btn_send_code.prop("disabled");
    btn_signin.prop("disabled",valid);
  });

  btn_send_code.on("click",function(){
    ipt_phone.prop("disabled",true);
    btn_send_code.prop("disabled",true);
    interval = setInterval(function(){
      btn_send_code.val(count + "秒");
      count--;
      if(count==0){
        count = 30;
        clearInterval(interval);
        btn_send_code.val("发送验证码").prop("disabled",false);
      }
    },1000);
    $.get("/api/v1/vcode?phone=" + ipt_phone.val());
  });


  btn_signin.on("click",function(){
    $.post("/api/v1/signin",{
      phone: ipt_phone.val(),
      code: ipt_vcode.val()
    },'json').done(function(response, status, xhr){
      location.href = "/";
    }).fail(function(){
      alert("验证失败，请正确填写");
    });
  });
});