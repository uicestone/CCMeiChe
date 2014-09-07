var db = require('../db');
var Model = require('./base');
var Order = Model("order");

module.exports = Order;


db.bind('order',{
  confirm: function(id,callback){
    var self = this;
    self.findById(id, function(err, order){
      if(err){
        return callback(err);
      }
      self.updateById(id, {
        $set:{
          status: "todo",
          order_time: new Date()
        }
      }, callback);
    });
  }
});