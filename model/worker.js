var Model = require('./base');
var Worker = Model("worker");

Worker.ensureIndex({"latlng":"2d"}, function(err, replies){
  console.log("ensureIndex", arguments);
});

module.exports = Worker;