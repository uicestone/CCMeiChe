var Order = require('../../model').order;
var _ = require('underscore');
module.exports = function(req,res,next){
  var query = req.query;

  var conditions = {};

  if(query.user){
    conditions["user._id"] = Order.id(query.user);
  }

  if(query.worker){
    conditions["worker._id"] = Order.id(query.worker);
  }

  Order.find(conditions).toArray(function(err, orders){
    if(err){
      return next(err);
    }

    orders = orders.map(function(order){
      order.worker = _.pick(order.worker, 'name');
      order.user = _.pick(order.user,'wechat_info');
      order = _.omit(order,'cancelled_former_order');
      return order;
    });
    res.send({
      data: orders
    });
  });
}