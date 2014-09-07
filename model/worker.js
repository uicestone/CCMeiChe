var db = require('../db');
var Model = require('./base');
var Worker = Model("worker");

Worker.ensureIndex({"latlng":"2d"}, function(err, replies){
  console.log("ensureIndex", arguments);
});

db.bind('worker',{
  findByOpenId: function(openid, callback){
    this.findOne({
      openid: openid
    }, callback);
  }
});

module.exports = Worker;