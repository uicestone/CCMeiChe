var worker = require("../../model/worker");
var config = require("config");
var baidumap = require("../../util/baidumap");
var async = require("async");

function washtime(){
  return config.washtime * 60 * 1000;
}


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
    openid:{
      $ne: null
    },
    status:"on_duty",
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
      var speedInMin = config.motor_speed * 1000 / (60 * 60 * 1000); // km/h 转换为 m/ms
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
          return done("solution parse error " + JSON.stringify(solution));
        }
        console.log(arguments);
        console.log(solution.result.routes[0].distance);
        var drive_time = solution.result.routes[0].distance / speedInMin;
        var wash_time = washtime();
        done(null,{
          worker_id: worker._id,
          drive_time: drive_time,
          wash_time: wash_time,
          finish_time: worker.last_available_time + drive_time + wash_time
        });
      });
    },function(err,results){
      if(err){return next(err);}
      function compare_nearest(a,b){
        return b.finish_time > a.finish_time ? -1 : 1;
      }
      console.log("results",results);
      results = results.sort(compare_nearest);

      res.status(200).send(results[0]);
    });
  });
}