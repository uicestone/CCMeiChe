var models = [
  "user",
  "vcode",
  "car"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});