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

MultiSelect.prototype.select = function(dataList){
  var items = this.items;
  var jsonList = dataList.map(function(data){return JSON.stringify(data);});
  dataList.forEach(function(data){
    items.filter(function(i){
      return JSON.stringify($(this).data("data")) == JSON.stringify(data);
    }).addClass("active");
  });
};


module.exports = function(container,itemSelector){
  return new MultiSelect(container,itemSelector);
}