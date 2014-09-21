var models = require("../../model/");
var Worker = models.worker;
var Order = models.order;
var User = models.user;
var config = require("config");
var baidumap = require("../../util/baidumap");
var moment = require("moment");
var async = require("async");
var _ = require("underscore");

function washtime(){
  return config.wash_time * 60 * 1000;
}

function findWorkers(latlng,callback){
  Worker.find({
    openid:{
      $ne: null
    },
    last_interaction_time:{$gt: new Date(+new Date() - 24 * 60 * 60 * 1000)},
    status:"on_duty",
    latlng:{
      $near: latlng
    }
  }).limit(5).toArray(function (err, workers) {
    if(err){return callback(err);}
    if(!workers.length){
      return callback({
        status: 400,
        message: "未找到可用车工"
      });
    }
    callback(null, workers);
  });
}

function nearestWorker(latlng, workers, callback){
  async.map(workers, function(worker, done){
    var motor_speed = 20; // km/h
    var worker_latlng = worker.last_available_latlng || worker.latlng ;
    var speedInMin = motor_speed * 1000 / (60 * 60 * 1000); // km/h 转换为 m/ms
    var getBaiduWalkSolution = baidumap.direction.bind(baidumap);
    var getFakeWalkSolution = function(args, callback){
      var solution = {
        result:{
          routes:[{
            distance: 5000
          }]
        }
      };
      callback(null, solution);
    };

    var getWalkSolution = process.env.DEBUG ? getFakeWalkSolution : getBaiduWalkSolution;

    getWalkSolution({
      origin: worker_latlng.join(","),
      destination: latlng.join(","),
      mode:"walking",
      origin_region: "上海",
      destination_region: "上海"
    }, function(err,solution){
      if(err){return done(err);}
      if(!solution || !solution.result || !solution.result.routes[0]){
        return done("solution parse error " + JSON.stringify(solution));
      }

      var drive_time = solution.result.routes[0].distance / speedInMin;
      var wash_time = washtime();
      var base_time;
      if(worker.last_available_time){
        base_time = Math.max(new Date(worker.last_available_time), new Date());
      }else{
        base_time = new Date();
      }

      var arrive_time = new Date(+base_time + drive_time);
      var finish_time = new Date(+base_time + drive_time + wash_time);
      console.log(drive_time, wash_time);
      console.log("车工%s可用时间%s，预估驾驶耗时%s，预估洗车耗时%s，预估完成时间%s，距当前时间需要耗时%s",
        worker.name,
        moment(base_time).format("lll"),
        moment.duration(drive_time).humanize(),
        moment.duration(wash_time).humanize(),
        moment(finish_time).format("lll"),
        moment.duration(+finish_time - (+ new Date())).humanize()
      );
      done(null,{
        drive_time: drive_time,
        wash_time: wash_time,
        arrive_time: arrive_time,
        finish_time: finish_time
      });
    });
  },function(err,results){
    if(err){return callback(err);}
    function compare_nearest(a,b){
      return b.finish_time > a.finish_time ? -1 : 1;
    }
    results = results.sort(compare_nearest);
    var result = results[0];
    callback(null,result);
  });
}

exports.post = function (req, res, next) {
  var user_latlng = req.body.latlng;

  // more validations here
  if (!user_latlng) {
    return next({
      status: 400,
      message: "missing latlng"
    });
  }

  var user = req.user;

  user_latlng = user_latlng.split(",").map(function(item){return +item});

  async.waterfall([
    function(done){
      findWorkers(user_latlng,done);
    },
    function(workers, done){
      nearestWorker(user_latlng,workers, done);
    }
  ], function(err, order){
    if(err){
      return next(err);
    }

    res.status(200).send(order);
  });
}