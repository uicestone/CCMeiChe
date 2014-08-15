var worker = require("../../model/worker");
var config = require("config");
var baidumap = require("../../util/baidumap");
var async = require("async");


exports.post = function (req, res, next) {
  if (!req.body.latlng) {
    return res.status(400).send("bad request");
  }

  var user_latlng = req.body.latlng;

  console.log("find ",user_latlng.split(",").map(function(item){return +item}));
  var kms = 50; // 周边500公里

  console.log("$near", user_latlng.split(",").map(function(item){return +item}));
  console.log("$maxDistance",kms / 111.12);
  worker.find({
    latlng:{
      // $near: user_latlng.split(",").map(function(item){return +item})
      $near: user_latlng.split(",").map(function(item){return +item}),
      $maxDistance: kms / 111.12 // in kilometers
    }
  }).limit(5).toArray(function (err, workers) {
    if(err){return next(err);}
    console.log(workers);
    async.map(workers, function(worker, done){
      var worker_latlng = worker.latlng;
      var speedInMin = config.motor_speed * 1000 / 60; // km/h 转换为 m/min
      console.log("from %s to %s",worker_latlng,user_latlng)
      baidumap.direction({
        origin: worker_latlng.join(","),
        destination: user_latlng,
        mode:"walking",
        origin_region: "上海",
        destination_region: "上海"
      }, function(err,solution){
        if(err){return done(err);}
        if(!solution || !solution.result || !solution.result.routes[0]){
          return done("solution is " + JSON.stringify(solution));
        }
        console.log(arguments);
        console.log(solution.result.routes[0].distance);
        done(null,{
          worker_id: worker._id,
          time: solution.result.routes[0].distance / speedInMin
        });
      });
    },function(err,results){
      if(err){return next(err);}
      function compare_nearest(a,b){
        return b.time > a.time ? -1 : 1;
      }
      console.log("results",results);
      results = results.sort(compare_nearest).map(function(item){
        item.time = item.time + config.wash_time;
        return item
      });

      res.status(200).send(results[0]);
    });
  });
}