var models = [
  "user",
  "vcode",
  "order",
  "worker",
  "service",
  "error",
  "cartype",
  "usermessage",
  "rechargeorder"
];

models.forEach(function(name){
  exports[name] = require("./" + name);
});