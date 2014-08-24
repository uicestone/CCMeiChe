var models = [
  "user",
  "vcode",
  "order",
  "worker",
  "service",
  "error"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});