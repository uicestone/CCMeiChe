var db = require('../db');
var Model = require('./base');
var _ = require('underscore');
var Worker = Model('worker');
var User = Model('user');
var Order = Model("order");
var Service = Model("service");
var async = require('async');
var moment = require('moment');
var estimate = require('../util/estimate');
var logger = require('../logger');
var ActionLog = require('../model/actionlog');

module.exports = Order;


db.bind('order', {
  confirm: function (id, callback) {
    var self = this;

    self.findById(id, function (err, order) {
      if (err || !order) {
        return callback(err);
      }

      if(order.processed){
        var error = new Error();
        error.name = "OrderProcessed";
        return callback(error);
      }


      Worker.findById(order.worker._id, function(err, worker){
        if (err || !order) {
          return callback(err);
        }

        ActionLog.log(worker, '排单', id);
        // 重新计算时间
        estimate.getTimes(order.latlng, worker, order.service, order.cars.length, function(err, times){
          if(err){return callback(err);}

          var now = new Date();
          order.processed = true;
          order.status = "todo";
          order.order_time = new Date();
          order.estimated_finish_time = times.finish_time,  // 预估完成时间
          order.estimated_arrive_time = times.arrive_time // 预估到达时间


          async.series([
            function(done){
              Order.updateById(id, order, done);
            },
            function(done){
              Worker.addOrder(order.worker._id, order, done);
            },
            function(done){
              User.charge(order.user._id, order, done);
            }
          ], function(err){
            if(err){
              return callback(err);
            }

            callback(null, order);
          });
        });
      });
    });
  },

  findWaitingOrdersByWorker: function(workerId, callback){
    Order.find({
      "worker._id": workerId,
      "status": {
        $in:["doing","todo"]
      }
    }).toArray(callback);
  },
  /**
   * 根据包月订单生成普通订单
   * 生成认为已到达
   */
  generateByMonthOrder: function(monthorder, worker, callback){
    var self = this;
    var wash_time = 60; // 速洗60分钟
    var neworder = {
      "address" : monthorder.address,
      "carpark" : monthorder.carpark,
      "cars" : monthorder.cars,
      "latlng" : [ 31.254461, 121.583934 ],
      "price" : 0,
      "monthpackage": monthorder._id,
      "arrive_time": new Date(),
      "estimated_finish_time": new Date(+new Date() + wash_time * 60 * 1000),
      "status" : "doing",
      "user": monthorder.user,
      "worker": worker,
      "service": monthorder.monthpackage
    };

    this.findOne({
      monthpackage: monthorder._id,
      status: "doing"
    }, function(err, order){
      if(err){return callback(err);}
      if(order){
        if(order.worker._id.toString() !== worker._id.toString()){
          return callback("该车已有其他车工正在清洗");
        }
        return callback(null, order);
      }
      self.insert(neworder, function(err, orders){
        if(err){
          return callback(err);
        }
        return callback(null, orders[0]);
      });
    });
  },
  getCurrent: function(workerId, callback){
    console.log(workerId);
    Order.findOne({
      $or: [{
        "worker._id": Worker.id(workerId),
        "status": "doing"
      },{
        "worker._id": Worker.id(workerId),
        "status": "todo"
      }]
    }, callback);
  },
  getMonthly: function(workerId, date, callback){
    var start = moment(date).startOf('month').toDate();
    var end = moment(date).endOf('month').toDate();
    Order.find({
      "worker._id": Worker.id(workerId),
      "status": "done",
      "finish_time":{
        $gt: start,
        $lt: end
      }
    }).toArray(callback);
  },
  arrive: function(id, callback){
    Order.findById(id, function(err, order){
      if(err){
        return done(err);
      }
      Order.updateById(id,{
        $set:{
          status: "doing",
          arrive_time: new Date()
        }
      }, function(err){
        if(err){
          return callback(err);
        }
        Worker.updateOrderStatus(order.worker._id, order, callback);
      });
    });
  },
  // 超过十分钟取消订单
  cancelTimeout: function(){
    Order.find({
      "status":"preorder",
      "preorder_time": {
        $lt: new Date( +new Date() - 10 * 60 * 1000)
      }
    }).toArray(function(err,orders){
      if(err){
        return;
      }
      async.map(orders, function(order, done){
        ActionLog.log(order.user, "取消超时订单", order._id);
        Order.cancel(order._id, "timeout", done);
      });
    });
  },
  cancel: function(id, reason, callback){
    var self = this;
    var util = require('util');
    var reasons = ["payment_cancel","payment_fail","preorder_cancel","order_cancel","admin_cancel","timeout"];
    if(reasons.indexOf(reason) == -1){
      return callback("invalid reason:" + reason);
    }
    ActionLog.log('系统',"取消订单", util.format("%s，原因:%s",id,reason));
    self.findById(id, function(err, order){
      if(order.status == "doing"){
        return callback({
          code: 400,
          message: "工人已到达，不可取消"
        });
      }
      async.series([
        function cancelOrder(done){
          self.updateById(id, {
            $set: {
              "status": "cancel",
              "cancel_reason": reason,
              "cancel_time": new Date()
            }
          }, done);
        },
        function removeFromWorkerQueue(done){
          Worker.removeOrder(order.worker._id, order._id, done);
        },
        function adjustRests(done){
          self._adjustRests(order, done);
        }
      ], callback);
    });
  },
  finish: function(orderId, data, callback){
    // if(!data.breakage || !data.finish_pics || !data.breakage_pics){
    //   return callback("missing params");
    // }

    Order.findById(orderId, function(err, order){
      if(err){
        return callback(err);
      }
      if(!order){
        return callback({
          status: 404,
          message: "not found"
        });
      }
      var finish_time = new Date();
      async.series([
        function(done){
          Order.updateById(orderId,{
            $set:{
              breakage: data.breakage,
              finish_pics: data.finish_pics,
              breakage_pics: data.breakage_pics,
              status: "done",
              finish_time: finish_time
            }
          }, done);
        },
        function(done){
          Worker.removeOrder(order.worker._id, order._id, done);
        },
        function(done){
          var former_avg_time = order.service.average_time || 30;
          var current_avg_time = finish_time - order.order_time;
          Service.updateById(order._id, {
            $set :{
              average_time: (former_avg_time + current_avg_time) / 2
            }
          }, done);
        }
      ], callback);

    });


  },
  _adjustRests: function(order, callback){
    var full_time = order.estimated_finish_time - new Date();
    Order.find({
      $and: [
        {
          "worker._id": order.worker._id
        },
        {
          $or: [
            {status:"preorder"},
            {status:"todo"}
          ]
        }
      ]
    }).toArray(function(err,orders){
      orders = orders.filter(function(doc){
        return doc.preorder_time > order.preorder_time
      });
      if(err){
        return callback(err);
      }
      async.map(orders,function(order,done){
        ActionLog.log("系统", "更正后续订单", "更正" + order._id + "后续订单");
        Order.updateById(order._id,{
          $set: {
            estimated_arrive_time: new Date(order.estimated_arrive_time - full_time),
            estimated_finish_time: new Date(order.estimated_finish_time - full_time)
          },
          $addToSet:{
            cancelled_former_order: _.pick(order,"_id")
          }
        }, done);
      }, callback);
    });
  }
});

// 每分钟检查一次超时订单
setInterval(function(){
  Order.cancelTimeout();
}, 60 * 1000);

Order.cancelTimeout();