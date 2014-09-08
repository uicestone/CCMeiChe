var db = require('../db');
var Model = require('./base');
var Order = Model("order");

module.exports = Order;


db.bind('order', {
  confirm: function (id, callback) {
    var self = this;
    self.findById(id, function (err, order) {
      if (err) {
        return callback(err);
      }
      var now = new Date();
      order.status = "todo";
      order.order_time = now();
      self.updateById(id, order, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, order);
      });
    });
  },
  cancel: function(id, reason, callback){
    var self = this;
    var reasons = ["payment_cancel","payment_fail","preorder_cancel","order_cancel","timeout"];
    if(reasons.indexOf(reason) == -1){
      return callback("invalid reason:" + reason);
    }
    self.findById(id, function(err, order){
      self.updateById(id, {
        $set: {
          "status": "cancel",
          "cancel_reason": reason,
          "cancel_time": new Date()
        }
      }, function(err){
        if(err){
          return callback(err);
        }
        var needAdjust = order.status !== "preorder";
        callback(null, needAdjust);
      });
    });
  },
  adjustRests: function(order, callback){
    var full_time = order.estimate_finish_time - order.preorder_time;
    this.update({
      $and: [
        {
          "worker._id": order.worker._id
        },
        {
          $or: [
            {status:"preorder"},
            {status:"todo"}
          ]
        },
        {
          $gt:{
            preorder_time: order.preorder_time
          }
        }
      ]
    },{
      $mul: {
        estimate_arrive_time: full_time,
        estimate_finish_time: full_time
      },
      $addToSet:{
        cancelled_former_order: order
      }
    }, callback);
  }
});