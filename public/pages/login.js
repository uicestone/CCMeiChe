var $ = require('zepto');

$(function(){
  var COUNT = 90;
  var ipt_phone = $("#phone");
  var ipt_vcode = $("#vcode");
  var btn_send_code = $("#getvcode");
  var btn_signin = $("#go");
  var interval = null;
  var count = COUNT;
  var step = 1;

  function numValid(){
    return ipt_phone.val().match(/^1(\d){10}$/);
  }

  function vcodeValid(){
    return ipt_vcode.val().match(/^(\d){6}$/);
  }

  function setBtnSend(){
    var valid = numValid() && step == 1;
    btn_send_code.prop("disabled", !valid);
  }

  function setBtnGo(){
    var valid = vcodeValid() && numValid() && btn_send_code.prop("disabled");
    btn_signin.prop("disabled",!valid);
  }

  function stepOne(){
    step = 1;
    count = COUNT;
    btn_send_code.val("发送验证码").prop("disabled",false);
    clearInterval(interval);
  }

  function stepTwo(){
    step = 2;
    ipt_phone.prop("disabled",true);
    btn_send_code.prop("disabled",true);
    btn_send_code.val(count + "秒");
    interval = setInterval(function(){
      count--;
      btn_send_code.val(count + "秒");
      if(count===0){
        stepOne();
      }
    },1000);
    $.get("/api/v1/vcode?phone=" + ipt_phone.val());
  }


  ipt_phone.on("keyup",setBtnSend).on("blur",setBtnSend);

  ipt_vcode.on("keyup",setBtnGo).on("blur",setBtnGo);

  btn_send_code.on("touchend",function(){
    if(btn_send_code.prop("disabled")){return;}
    stepTwo();
    setBtnGo();
  });


  btn_signin.on("touchend",function(){
    if(btn_signin.prop("disabled")){return;}
    btn_signin.prop("disabled",true);
    $.post("/api/v1/signin",{
      phone: ipt_phone.val(),
      code: ipt_vcode.val(),
      access_token: window.access_token,
      openid: window.openid
    },'json').done(function(response, status, xhr){
      location.href = "/";
    }).fail(function(xhr){
      alert(xhr.responseText || "验证失败，请正确填写");
    btn_signin.prop("disabled",false);
    });
  });
});