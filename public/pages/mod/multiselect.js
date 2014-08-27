var $ = require("zepto");

function MultiSelect(container,itemSelector){
  container = $(container);
  var items = this.items = container.find(itemSelector);
  items.each(function(i,item){
    $(item).on("touchend",function(){
      $(this).toggleClass("active");
    })
  });
  return this;
}

MultiSelect.prototype.select = function(text){
  this.items.filter(function(i){return $(this).text().trim() == text}).addClass("active");
};


module.exports = function(container,itemSelector){
  return new MultiSelect(container,itemSelector);
}