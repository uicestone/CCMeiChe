var models = [
  "user",
  "vcode",
  "car",
  "order",
  "worker"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});