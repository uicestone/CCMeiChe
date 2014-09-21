var db = require('../db');
var Model = require('./base');
var Worker = Model("worker");
var Order = Model('order');
var config = require('config');
var _ = require("underscore");
var moment = require('moment');
var async = require('async');

Worker.ensureIndex({"latlng":"2d"}, function(err, replies){
  console.log("ensureIndex", arguments);
});

function lastOrder(orders){
  console.log("getting last order of ", orders);
  return orders.sort(function(a,b){
    return b.preorder_time > a.preorder_time ? 1 : -1;
  })[0];
}

db.bind('worker',{
  findByOpenId: function(openid, callback){
    Worker.findOne({
      openid: openid
    }, callback);
  },
  getMessage: function(workerId, meta, callback){
    var order = meta.order;
    var action = meta.action;

    Worker.findById(workerId, function(err, worker){
      if(err){
        return callback(err);
      }
      var orders = worker.orders.filter(function(order){
        return order.status !== "preorder";
      });
      var last_order = lastOrder(orders);
      var message;
      var cancelMessage = _.template("用户<%=user.phone%>取消了<%=address%> <%=cars.map(function(car){return car.type + car.number;}).join(',')%>车辆的清洗，请原地等待后续订单");
      var offDutyMessage = function(orders){
        return ("你现在有" + orders.length + "笔任务待完成，预计下班时间：" + moment(last_order.estimated_finish_time).format("lll"));
      };
      var newOrder = function(prefix, order){
        return prefix + "：" + config.host.worker + "/orders/" + order._id;
      }

      if(action == "cancel"){
        if(orders.length === 0){
          message = cancelMessage(order);
        }else{
          message = newOrder("下一笔订单", last_order) + "\n";
          message += offDutyMessage(orders);
        }
      }else if(action == "new"){
        if(orders.length === 1){
          message = newOrder("你有一笔新订单，点击查看", last_order);
        }else{
          message = offDutyMessage(orders);
        }
      }

      console.log("New Message:",message);
      callback(null, message);
    });
  },
  updateLastIntraction: function(openid, callback){
    Worker.update({
      openid: openid
    }, {
      $set: {
        last_interaction_time: new Date()
      }
    }, callback)
  },
  /* 用于微信更新用户状态 */
  updateStatus: function(openid, latlng, callback){
    Worker.findByOpenId(openid, function(err, worker){
      if(err){
        return callback(err);
      }

      Worker.update({
        openid: openid
      },{
        $set:{
          last_available_time: worker.orders && worker.orders.length ? worker.last_available_time : new Date(),
          last_available_latlng: worker.orders && worker.orders.length ? worker.last_available_latlng : latlng,
          latlng:latlng
        }
      },callback);
    });
  },
  addOrder: function(workerId, order, callback){
    if(order.status !== "todo"){
      callback("order status is not todo!");
    }
    Worker.updateById(workerId, {
      $set:{
        last_available_time: order.estimated_finish_time,
        last_available_latlng: order.latlng
      },
      $addToSet: {
        orders: _.pick(order,'_id','preorder_time','latlng','estimated_finish_time','status')
      }
    }, callback);
  },
  removeOrder: function(workerId, orderId, callback){

    var worker = null;
    var last_order = null;
    async.series([
      function(done){
        Worker.updateById(workerId, {
          $pull: {
            "orders": {
              _id: orderId
            }
          }
        }, done);
      },
      function(done){
        Worker.findById(workerId, function(err, result){
          if(err){
            return done(err);
          }
          worker = result;
          done(null);
        });
      },
      function(done){
        Order.find({
          "worker._id": Worker.id(workerId),
          "status": "todo"
        }).toArray(function(err, orders){
          if(err){
            return done(err);
          }

          console.log("ORDERSSSSSSSSSSSSS", orders);
          last_order = lastOrder(orders);
          done(null);
        });
      },
      function(done){
        console.log("最后一笔订单",last_order);
        if(last_order){
          console.log("根据车工手头最后一笔订单",last_order._id);
        }else{
          console.log("无后续订单");
        }
        var last_available_time = last_order ? last_order.estimated_finish_time : new Date();
        var last_available_latlng = last_order ? last_order.latlng : worker.latlng;
        console.log("调整车工时间%s,位置%s",moment(last_available_time).format('lll'),last_available_latlng);

        Worker.updateById(workerId, {
          $set:{
            last_available_latlng: last_available_latlng,
            last_available_time: last_available_time
          }
        }, done);
      }
    ], callback);
  },
  updateOrderStatus: function(id, order, callback){
    Worker.update({
      _id: id,
      "orders._id": order._id
    }, {
      $set:{
        "orders.$.status": order.status
      }
    }, callback);
  },
  getNextOrder: function(workerId, callback){
    Order.findOne({
      "worker._id": workerId,
      "status":"todo"
    },callback);
  },
  onDuty: function(openid, callback){
    Worker.findByOpenId(openid, function(err, worker){
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
    Worker.update({
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