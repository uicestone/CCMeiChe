var worker = require("../../model/worker");
var config = require("config");
var baidumap = require("../../util/baidumap");
var async = require("async");


exports.post = function (req, res, next) {
  if (!req.body.latlng) {
    return res.status(400).send("bad request");
  }

  var user_latlng = req.body.latlng;

  worker.find({
    latlng:{
      $near:user_latlng.split(",").map(function(item){return +item}),
      $maxDistance: 1/112
    }
  }).limit(5).toArray(function (err, workers) {
    async.map(workers, function(worker, done){
      var worker_latlng = worker.latlng;
      baidumap.direction({
        origin: latlng.join(","),
        destination: user_latlng,
        mode:"walking",
        origin_region: "上海",
        destination_region: "上海"
      }, function(err,solution){
        if(err){return done(err);}
        done(null,{
          id: worker._id,
          time: solution.result.routes[0].distances / config.motor_speed
        });
      });
    },function(err,results){
      if(err){return next(err);}
      function compare_nearest(a,b){
        return b.time > a.time ? -1 : 1;
      }
      res.status(200).send(results.sort(compare_nearest)[0]);
    });
  });
}