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
  });
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