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
  }
});