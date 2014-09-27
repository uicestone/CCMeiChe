var $ = require("zepto");
var swipeModal = require("../mod/swipe-modal");

module.exports = swipeModal.create({
  button: $(".addcar"),
  template:  require("../tpl/agreement.html"),
  show: function(data){
    var elem = this.elem;
    var content = window.agreement.replace(/\n/,"<br />");
    var contentel = this.elem.find(".content");
    contentel.html(content);
    contentel.css('height', $(window).height() - 152 );
  }
});