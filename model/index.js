var models = [
  "user",
  "vcode"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});