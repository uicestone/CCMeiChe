var Worker = require('../../model').worker;
var Order = require('../../model').order;
var moment = require('moment');
var async = require('async');
var _ = require('underscore');

exports.clear = function(req,res,next){
  Worker.remove(function(err){
    if(err){
      return next(err)
    }else{
      res.status(200).send({message:"ok"});
    }
  });
}


exports.list = function(req,res,next){
  async.waterfall([
    function(done){
      Worker.find().toArray(done);
    },
    function(workers, done){
      async.map(workers, function(worker, done){
        Order.find({
          "worker._id": worker._id,
          "status": "done"
        }).toArray(function(err, orders){
          if(err){done(err);}

          worker.monthly_order_count = orders.filter(function(order){
            var ft = new Date(order.finish_time);
            return moment().startOf('month').toDate() < ft && moment().endOf('month').toDate() > ft;
          }).length;
          worker.totally_order_count = orders.length;
          done(null, _.pick(worker,'_id','wechat_info','status','latlng','last_interaction_time','name','phone','monthly_order_count','totally_order_count'));
        });
      }, done);
    }
  ], function(err, workers){
    if(err){
      return next(err);
    }
    res.send({
      data: workers
    });

  });
}

exports.create = function(req,res,next){
  if(!req.body.name || !req.body.phone || !req.body.openid){
    return res.send(400,{
      code: 400,
      message: "参数不完整"
    });
  }

  var data = {
    name: req.body.name,
    phone: req.body.phone,
    openid: req.body.openid
  }

  if(!data.phone.match(/^1\d{10}/)){
    return res.send(400,{
      code: 400,
      message: "错误的手机格式"
    });
  }

  Worker.insert(data, function(err, workers){
    if(err){
      return next(err);
    }

    res.send(200, workers[0]);
  });


}