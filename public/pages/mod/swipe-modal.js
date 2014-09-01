var util = require("util");
var events = require("events");
var viewSwipe = require("view-swipe");
var $ = require("zepto");


function SwipeModal(config){
  var self = this;
  var submit = config.submit;
  var elem = this.elem = $(config.template);
  var getData = config.getData;
  var validate = config.validate;
  var button = config.button;
  var submit = config.submit;
  this._show = config.show;

  elem.find(".submit").on("touchend",function(){
    var data = this.getData();
    var isValid = this.validate();

    if(isValid){
      if(!submit){
        self.emit("submit",data);
      }else{
        submit(data,function(result){
          viewSwipe.out("bottom");
          self.emit("submit",result);
        });
      }
      viewSwipe.out("bottom");
    }
  });

  elem.find(".cancel").on("touchend", function(){
    self.emit("cancel");
    viewSwipe.out("bottom");
  });
}

util.inherits(SwipeModal,events);

SwipeModal.prototype.show = function(){
  this.emit("show");
  viewSwipe.in(this.elem[0],"bottom");
  this._show();
}

exports.create = function(config){
  return new SwipeModal(config);
}