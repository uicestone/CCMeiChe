var db = require('../db');
var Model = require('./base');
var Worker = Model("worker");
var config = require('config');
var _ = require("underscore");
var moment = require('moment');

Worker.ensureIndex({"latlng":"2d"}, function(err, replies){
  console.log("ensureIndex", arguments);
});

function lastOrder(orders){
  return orders.sort(function(a,b){
    return b.preorder_time > a.preorder_time ? 1 : -1;
  })[0];
}

db.bind('worker',{
  findByOpenId: function(openid, callback){
    this.findOne({
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
      var orders = worker.orders;
      var last_order = lastOrder(orders);
      var message;
      var cancelMessage = _.template("用户<%=user.phone%>取消了<%=address%> <%=cars.map(function(car){return car.type + car.number;}).join(',')%>车辆的清洗，请原地等待后续订单");
      var offDutyMessage = function(orders){
        ("你现在有" + orders.length + "笔任务待完成，预计下班时间：" + moment(last_order.estimated_finish_time).format("lll"));
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
          message = newOrder("你有一比新订单，点击查看", last_order);
        }else{
          message = offDutyMessage(orders);
        }
      }

      console.log("New Message:",message);
      callback(null, message);
    });
  },
  updateStatus: function(openid, latlng, callback){
    this.findByOpenId(openid, function(err, worker){
      Worker.update({
        openid: openid
      },{
        $set:{
          last_available_time: worker.orders.length ? worker.last_available_time : new Date(),
          last_available_latlng: worker.orders.length ? worker.last_available_latlng : latlng,
          latlng:latlng
        }
      });
    });
  },
  addOrder: function(workerId, order, callback){
    Worker.updateById(workerId, {
      $set:{
        last_available_time: order.estimated_finish_time,
        last_available_latlng: order.latlng
      },
      $addToSet: {
        orders: order
      }
    }, callback);
  },
  removeOrder: function(workerId, order, callback){
    Worker.updateById(workerId, {
      $pull: {
        "orders": {
          _id: order._id
        }
      }
    }, function(err, orders){
      if(err){
        return callback(err);
      }
      Worker.findById(workerId, function(err,worker){
        if(err){
          return callback(err);
        }

        var orders = worker.orders;
        var last_order = lastOrder(orders)

        Worker.updateById(workerId, {
          $set:{
            last_available_latlng: last_order ? last_order.latlng : worker.latlng,
            last_available_time: last_order ? last_order.estimated_finish_time : new Date()
          }
        }, callback);
      });
    });
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