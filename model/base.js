var db = require("../db");


var Model = function(collection){
  return db.collection(collection);
};

module.exports = Model