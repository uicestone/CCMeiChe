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
  },
  onDuty: function(openid, callback){
    this.findByOpenId(openid, function(err, worker){
      if(err){return callback(err)}
      var now = new Date();
      var last_available_time;
      if(worker.last_available_time && worker.last_available_time > now){
        last_available_time = worker.last_available_time;
      }else{
        last_available_time = now;
      }
      Worker.update({
        openid: openid
      },{
        $set:{
          last_available_time: last_available_time,
          status:"on_duty"
        }
      },callback);
    });
  },
  offDuty: function(openid, callback){
    this.update({
      openid: openid
    },{
      $set:{
        status:"off_duty",
        last_available_time: null
      }
    },callback);
  }
});

module.exports = Worker;