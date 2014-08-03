var $ = require("zepto");
var tpl = require("tpl");


var chinese_numbers = "一二三四五六七八九十".split("");
var carsList = $(".cars ul");
$(".cars .add").on("click", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    // addcar.show();
    addcar.on("add",function(data){
      var template = "<li><div class='index'>车型@{it.index}</div>"
        +"<div class='detail'>"
          +"<div class='type'>@{it.type}@{it.color}</div>"
          +"<div class='number'>@{it.number}</div>"
        +"</div></li>";
      data.index = chinese_numbers[ carsList.find("li").length ];
      var html = tpl.render(template,data);
      var li = $(html);
      console.log(li);
      carsList.append(li);
      addbtn.prop("disable",false);
    });
    addcar.emit("add",{
      type:"奥迪A8",
      number:"沪A91223",
      color:"白色"
    });
  });
});

$(".cars .add").trigger("click");