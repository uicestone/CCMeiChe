var config = require('config');
var Model = require("../model/base");
var async = require("async");
var baidumap = require("./baidumap");
var moment = require("moment");
var Worker = Model('worker');
var logger = require("../logger");


var getTimes = exports.getTimes = function(latlng, worker, service, done){
  var motor_speed = 20; // km/h
  var worker_latlng = worker.last_available_latlng || worker.latlng;
  var speedInMin = motor_speed * 1000 / (60 * 60 * 1000); // km/h 转换为 m/ms
  var getBaiduWalkSolution = baidumap.direction.bind(baidumap);
  var getWalkSolution = process.env.DEBUG ? getBaiduWalkSolution : getBaiduWalkSolution;

  getWalkSolution({
    origin: worker_latlng.join(","),
    destination: latlng.join(","),
    mode:"walking",
    origin_region: "上海",
    destination_region: "上海"
  }, function(err,solution){
    if(err){console.log(err);return done("服务器出了点麻烦，无法获取车工用时");}
    if(!solution || !solution.result || !solution.result.routes[0]){
      return done("solution parse error " + JSON.stringify(solution));
    }

    var drive_time = solution.result.routes[0].distance / speedInMin;
    var wash_time = washTime(service);

    var base_time;
    if(worker.last_available_time){
      base_time = Math.max(new Date(worker.last_available_time), new Date());
    }else{
      base_time = new Date();
    }

    var arrive_time = new Date(+base_time + drive_time);
    var finish_time = new Date(+base_time + drive_time + wash_time);
    var data = {
      worker: worker,
      drive_time: drive_time,
      wash_time: wash_time,
      arrive_time: arrive_time,
      finish_time: finish_time
    };
    printData(data);
    done(null,data);
  });
}

function washTime(service){
  return (service.wash_time || config.wash_time) * 60 * 1000;
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

    // workers = workers.filter(function(worker){
    //   if(worker && +new Date(worker.last_available_time) < +new Date()){
    //     return false;
    //   }else{
    //     return true;
    //   }
    // });

    if(!workers.length){
      return callback({
        status: 400,
        message: "未找到可用车工"
      });
    }
    callback(null, workers);
  });
}

function nearestWorker(latlng, workers, service, callback){
  logger.info('[订单查找] 根据经纬度%s查找附近车工', latlng);
  async.map(workers, function(worker, done){
    getTimes(latlng, worker, service, done);
  }, function(err,results){
    if(err){return callback(err);}
    function compare_nearest(a,b){
      return b.finish_time > a.finish_time ? -1 : 1;
    }

    if(!results.length){
      return callback(null);
    }

    results = results.sort(compare_nearest);
    var result = results[0];

    logger.info('[订单查找] 选择车工%s', result.worker.name);
    callback(null,result);
  });
}

function getFakeWalkSolution(args, callback){
  var solution = {
    result:{
      routes:[{
        distance: 5000
      }]
    }
  };
  callback(null, solution);
}

function printData(data){
  logger.info("[订单查找] 车工%s最后可用位置%s，当前位置%s，可用时间%s，预估驾驶耗时%s，预估洗车耗时%s，预估完成时间%s，距当前时间需要耗时%s",
    data.worker.name,
    data.worker.last_available_latlng ? data.worker.last_available_latlng.join(",") : "无",
    data.worker.latlng.join(","),
    moment(data.base_time).format("lll"),
    moment.duration(data.drive_time).humanize(),
    moment.duration(data.wash_time).humanize(),
    moment(data.finish_time).format("lll"),
    moment.duration(+data.finish_time - (+ new Date())).humanize()
  );
}


exports.getSolution = function(latlng, service, callback){
  async.waterfall([
    function(done){
      findWorkers(latlng, done);
    },
    function(workers, done){
      nearestWorker(latlng, workers, service, done);
    }
  ], callback);
};

