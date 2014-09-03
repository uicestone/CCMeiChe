var models = [
  "user",
  "vcode",
  "order",
  "worker",
  "service",
  "error",
  "cartype",
  "usermessage",
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});