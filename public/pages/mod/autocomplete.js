var $ = require("zepto");

function Autocomplete(input, pattern, parser){
  input = $(input);
  var self = this;
  var list = $("<ul class='autocomplete' />");
  this.list = list;
  input.after(list);
  var delay = 200;
  var timeout = null;
  input.on("keyup", function(){
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      var value = input.val();
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",value)
      }).done(function(data){
        if(!data.length){return;}
        list.empty();
        data.forEach(function(item){
          var li = $("<li>" + item + "</li>");
          li.on("touchend",function(){
            input.val(item);
            self.hide();
          });
          $(list).append(li);
        });
        var packup = $("<li class='packup'>收起</li>");
        packup.on("touchend",function(){
          self.hide();
        });
        list.append(packup);
        self.show();
      }).fail(function(){
        console.log("failed");
      });
    },delay);
  });
}

Autocomplete.prototype.show = function(){
  this.list.show();
}


Autocomplete.prototype.hide = function(){
  this.list.hide();
}


exports.init = function(input, parser){
  var pattern = input.attr("data-pattern");
  if(!pattern){return;}
  new Autocomplete(input, pattern, parser);
}