var models = [
  "user",
  "vcode",
  "order",
  "worker",
  "service",
  "error",
  "cartype"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});