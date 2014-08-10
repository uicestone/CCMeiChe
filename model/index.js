var models = [
  "user",
  "vcode",
  "order",
  "worker",
  "service"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});