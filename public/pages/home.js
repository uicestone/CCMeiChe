var $ = require("zepto");

$(".cars .add").on("click", function(){
  var addbtn = $(this);
  addbtn.prop("disable",true);
  require.async("./addcar.js",function(addcar){
    addcar.show();
    addcar.on("distory",function(){
      addbtn.prop("disable",false);
    });
  });
});

$(".cars .add").trigger("click");