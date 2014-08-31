var worker = require("../../model/worker");
var config = require("config");
var baidumap = require("../../util/baidumap");
var moment = require("moment");
var async = require("async");

function washtime(){
  return config.wash_time * 60 * 1000;
}


exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;
  if (!user_latlng) {
    return next({
      status: 400,
      message: "missing latlng"
    });
  }
  var kms = 50; // 周边50公里

  worker.find({
    openid:{
      $ne: null
    },
    status:"on_duty",
    latlng:{
      $near: user_latlng.split(",").map(function(item){return +item}),
      $maxDistance: kms / 111.12 // in kilometers
    }
  }).limit(5).toArray(function (err, workers) {
    if(err){return next(err);}
    if(!workers.length){
      return next({
        status: 400,
        message: "未找到可用车工"
      });
    }

    async.map(workers, function(worker, done){
      var worker_latlng = worker.latlng;
      var speedInMin = config.motor_speed * 1000 / (60 * 60 * 1000); // km/h 转换为 m/ms

      // 通过百度api查询路线
      console.log("查询baidu地图路线 %s 到 %s",worker_latlng,user_latlng);
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

        if(!worker.last_available_time){
          return done("worker " + worker._id + " do not have last_available_time");
        }

        var drive_time = solution.result.routes[0].distance / speedInMin;
        var wash_time = washtime();
        var base_time = Math.max(new Date(worker.last_available_time), new Date());
        done(null,{
          worker: worker,
          drive_time: drive_time,
          wash_time: wash_time,
          finish_time: new Date(base_time + drive_time + wash_time)
        });
      });
    },function(err,results){
      if(err){return next(err);}
      function compare_nearest(a,b){
        return b.finish_time > a.finish_time ? -1 : 1;
      }
      results = results.sort(compare_nearest);
      console.log("生成预估结果",results[0]);
      res.status(200).send(results[0]);
    });
  });
}